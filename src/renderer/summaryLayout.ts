import type { CliOptions, TapDocument } from "../ir/types.js";
import { summarize } from "../ir/summary.js";
import { fenced, heading } from "./format.js";
import { renderSummaryLine } from "./specLayout.js";

export function renderSummaryLayout(document: TapDocument, options: CliOptions): string {
  const lines = [renderSummaryLine(summarize(document))];
  if (document.bailout) {
    lines.push("", `> **Bailout: ${document.bailout.reason || "(none)"}**`);
  }
  if (options.includeRaw) {
    lines.push("", heading(2, "Raw TAP"), "", fenced(document.raw, "tap"));
  }
  return `${lines.join("\n")}\n`;
}
