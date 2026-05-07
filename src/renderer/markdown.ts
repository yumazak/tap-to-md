import type { CliOptions, TapDocument } from "../ir/types.js";
import { renderSpecLayout } from "./specLayout.js";

export function renderMarkdown(document: TapDocument, options: CliOptions): string {
  return renderSpecLayout(document, options);
}
