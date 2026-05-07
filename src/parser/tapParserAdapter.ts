import { Parser } from "tap-parser";
import type {
  BailOut,
  Diagnostic,
  ParserWarning,
  Plan,
  TapDocument,
  TestResult,
} from "../ir/types.js";

interface TapAssert {
  id?: number;
  name?: string;
  ok: boolean;
  skip?: string | boolean;
  todo?: string | boolean;
  diag?: unknown;
  diagnostic?: unknown;
}

interface ParserLike {
  name?: string;
  on(event: string, listener: (...args: unknown[]) => void): ParserLike;
  write(chunk: string): unknown;
  end(chunk?: string): unknown;
}

interface CompleteResults {
  failures?: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function indentLines(value: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n");
}

function yamlScalar(value: string | number | boolean | null): string {
  if (value === null) {
    return "null";
  }
  return String(value);
}

function toYaml(value: unknown, indent = 0): string {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const scalar = yamlScalar(value);
    if (typeof value === "string" && value.includes("\n")) {
      return `|\n${indentLines(value.replace(/\n$/, ""), indent + 2)}`;
    }
    return scalar;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isRecord(item) || Array.isArray(item)) {
          return `${" ".repeat(indent)}-\n${toYaml(item, indent + 2)}`;
        }
        return `${" ".repeat(indent)}- ${toYaml(item, indent + 2)}`;
      })
      .join("\n");
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => {
        if (isRecord(item) || Array.isArray(item)) {
          return `${" ".repeat(indent)}${key}:\n${toYaml(item, indent + 2)}`;
        }
        return `${" ".repeat(indent)}${key}: ${toYaml(item, indent + 2)}`;
      })
      .join("\n");
  }

  return String(value);
}

function diagnosticFrom(value: unknown): Diagnostic[] {
  if (!value) {
    return [];
  }
  if (typeof value === "string") {
    return [{ raw: value.trimEnd() }];
  }
  return [{ raw: toYaml(value).trimEnd() }];
}

function warningFrom(value: unknown): ParserWarning {
  if (value instanceof Error) {
    return { message: value.message };
  }
  if (typeof value === "string") {
    return { message: value };
  }
  return { message: JSON.stringify(value) };
}

function tapErrorFrom(value: unknown): ParserWarning | undefined {
  if (!isRecord(value) || value.tapError === undefined || value.tapError === null) {
    return undefined;
  }
  return { message: String(value.tapError) };
}

function planFrom(value: unknown): Plan | undefined {
  if (typeof value === "object" && value !== null) {
    const plan = value as Record<string, unknown>;
    const start = Number(plan.start ?? plan.from ?? 1);
    const end = Number(plan.end ?? plan.to ?? plan.count);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      return { start, end };
    }
  }
  return undefined;
}

function bailoutFrom(value: unknown): BailOut {
  if (typeof value === "string") {
    return { reason: value };
  }
  if (typeof value === "object" && value !== null && "reason" in value) {
    return { reason: String((value as { reason: unknown }).reason) };
  }
  return { reason: "" };
}

function normalizeAssert(value: TapAssert): TestResult {
  const diagnostics = [
    ...diagnosticFrom(value.diag),
    ...diagnosticFrom(value.diagnostic),
  ];
  return {
    id: value.id,
    name: value.name?.trim() || `test ${value.id ?? ""}`.trim(),
    ok: value.ok,
    skip: value.skip,
    todo: value.todo,
    diagnostics,
    comments: [],
    children: [],
  };
}

function wireParser(parser: ParserLike, raw: string): TapDocument {
  const document: TapDocument = {
    tests: [],
    comments: [],
    warnings: [],
    raw,
  };
  const pendingChildren: TestResult[][] = [];
  let lastTest: TestResult | undefined;

  parser.on("version", (version) => {
    document.version = Number(version);
  });
  parser.on("plan", (plan) => {
    document.plan = planFrom(plan);
  });
  parser.on("comment", (comment) => {
    const text = String(comment).replace(/^#\s?/, "").trimEnd();
    if (lastTest) {
      lastTest.comments.push(text);
    } else {
      document.comments.push(text);
    }
  });
  parser.on("extra", (extra) => {
    if (lastTest) {
      lastTest.diagnostics.push({ raw: String(extra).trimEnd() });
    }
  });
  parser.on("assert", (assertion) => {
    const test = normalizeAssert(assertion as TapAssert);
    if (pendingChildren.length > 0) {
      for (const children of pendingChildren.splice(0)) {
        test.children.push(...children);
      }
    }
    document.tests.push(test);
    lastTest = test;
  });
  parser.on("bailout", (bailout) => {
    document.bailout = bailoutFrom(bailout);
  });
  parser.on("child", (child) => {
    const childParser = child as ParserLike;
    const childDoc = wireParser(childParser, "");
    document.comments.push(...childDoc.comments.map((comment) => `${childParser.name ?? "subtest"}: ${comment}`));
    pendingChildren.push(childDoc.tests);
  });
  parser.on("warning", (warning) => {
    document.warnings.push(warningFrom(warning));
  });
  parser.on("error", (error) => {
    document.warnings.push(warningFrom(error));
  });
  parser.on("complete", (results) => {
    const complete = results as CompleteResults;
    for (const failure of complete.failures ?? []) {
      const warning = tapErrorFrom(failure);
      if (warning) {
        document.warnings.push(warning);
      }
    }
  });

  return document;
}

export async function parseTap(tapText: string): Promise<TapDocument> {
  const parser = new Parser({ bail: false }) as ParserLike;
  const document = wireParser(parser, tapText);
  parser.end(tapText);
  return document;
}
