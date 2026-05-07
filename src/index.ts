export { parseTap } from "./parser/tapParserAdapter.js";
export { buildIr } from "./ir/buildIr.js";
export { summarize } from "./ir/summary.js";
export { renderMarkdown } from "./renderer/markdown.js";
export type {
  BailOut,
  CliOptions,
  Diagnostic,
  ParserWarning,
  Plan,
  Summary,
  TapDocument,
  TestResult,
} from "./ir/types.js";
