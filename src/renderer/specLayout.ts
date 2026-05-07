import type { CliOptions, Summary, TapDocument, TestResult } from "../ir/types.js";
import { summarize } from "../ir/summary.js";
import { fenced, heading, statusText, truncateBytes } from "./format.js";

function renderSummaryLine(summary: Summary): string {
  const parts = [`合計 ${summary.total}`, `成功 ${summary.passed}`];
  if (summary.failed > 0) {
    parts.push(`**失敗 ${summary.failed}**`);
  }
  if (summary.todo > 0) {
    parts.push(`TODO ${summary.todo}`);
  }
  if (summary.skipped > 0) {
    parts.push(`SKIP ${summary.skipped}`);
  }
  if (summary.warnings > 0) {
    parts.push(`警告 ${summary.warnings}`);
  }
  return parts.join(" / ");
}

function shouldRenderTest(test: TestResult, options: CliOptions): boolean {
  if (!options.failOnly) {
    return true;
  }
  if (test.children.length === 0) {
    return !test.ok;
  }
  return test.children.some((child) => shouldRenderTest(child, options));
}

function renderLeafLabel(test: TestResult): string {
  const status = statusText(test.ok, test.skip, test.todo);
  if (status === "SKIP") {
    return `${test.name} *(SKIP)*`;
  }
  if (status === "TODO") {
    return `${test.name} *(TODO)*`;
  }
  if (status === "FAIL") {
    return `${test.name} **(FAIL)**`;
  }
  return test.name;
}

function renderDiagnostics(test: TestResult, options: CliOptions): string[] {
  const lines: string[] = [];
  for (const diagnostic of test.diagnostics) {
    const raw = truncateBytes(diagnostic.raw, options.maxDiagnostics).trimEnd();
    for (const line of raw.split("\n")) {
      lines.push(`  > ${line}`);
    }
  }
  return lines;
}

function renderLeaf(test: TestResult, options: CliOptions): string[] {
  return [`- ${renderLeafLabel(test)}`, ...renderDiagnostics(test, options)];
}

function renderContainer(test: TestResult, options: CliOptions, depth: number): string[] {
  if (!shouldRenderTest(test, options)) {
    return [];
  }

  const lines = [heading(Math.min(1 + depth, 6), test.name)];
  const children = test.children.filter((child) => shouldRenderTest(child, options));
  if (children.length === 0) {
    return lines;
  }

  lines.push("");
  if (children.some((child) => child.children.length > 0)) {
    const blocks = children.map((child) => renderTest(child, options, depth + 1));
    lines.push(...blocks.filter((block) => block.length > 0).flatMap((block, index) => {
      if (index === 0) {
        return block;
      }
      return ["", ...block];
    }));
    return lines;
  }

  lines.push(...children.flatMap((child) => renderLeaf(child, options)));
  return lines;
}

function renderTest(test: TestResult, options: CliOptions, depth: number): string[] {
  if (test.children.length === 0) {
    return shouldRenderTest(test, options) ? renderLeaf(test, options) : [];
  }
  return renderContainer(test, options, depth);
}

function renderTests(document: TapDocument, options: CliOptions): string[] {
  const lines: string[] = [];
  let previousWasLeaf = false;

  for (const test of document.tests) {
    const block = renderTest(test, options, 0);
    if (block.length === 0) {
      continue;
    }
    const currentIsLeaf = block[0]?.startsWith("- ") ?? false;
    if (lines.length > 0 && !(previousWasLeaf && currentIsLeaf)) {
      lines.push("");
    }
    lines.push(...block);
    previousWasLeaf = currentIsLeaf;
  }

  return lines;
}

export function renderSpecLayout(document: TapDocument, options: CliOptions): string {
  const lines = [renderSummaryLine(summarize(document))];

  if (document.bailout) {
    lines.push("", `> **Bailout: ${document.bailout.reason || "(none)"}**`);
  }
  if (options.includeComments && document.comments.length > 0) {
    lines.push("", ...document.comments.map((comment) => `> ${comment}`));
  }

  const tests = renderTests(document, options);
  if (tests.length > 0) {
    lines.push("", ...tests);
  }
  if (options.includeRaw) {
    lines.push("", heading(2, "Raw TAP"), "", fenced(document.raw, "tap"));
  }
  return `${lines.join("\n")}\n`;
}

export { renderSummaryLine };
