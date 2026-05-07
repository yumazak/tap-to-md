import type { CliOptions, TapDocument } from "../ir/types.js";
import { renderSpecLayout } from "./specLayout.js";
import { renderSummaryLayout } from "./summaryLayout.js";

export function renderMarkdown(document: TapDocument, options: CliOptions): string {
  return options.layout === "summary"
    ? renderSummaryLayout(document, options)
    : renderSpecLayout(document, options);
}
