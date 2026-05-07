import type { Summary, TapDocument, TestResult } from "./types.js";

function visit(test: TestResult, summary: Summary): void {
  summary.total += 1;
  if (test.ok) {
    summary.passed += 1;
  } else {
    summary.failed += 1;
  }
  if (test.skip) {
    summary.skipped += 1;
  }
  if (test.todo) {
    summary.todo += 1;
  }
  for (const child of test.children) {
    visit(child, summary);
  }
}

export function summarize(document: TapDocument): Summary {
  const summary: Summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    bailout: Boolean(document.bailout),
    warnings: document.warnings.length,
  };
  for (const test of document.tests) {
    visit(test, summary);
  }
  return summary;
}
