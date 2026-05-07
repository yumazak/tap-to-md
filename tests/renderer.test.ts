import { describe, expect, test } from "bun:test";
import type { CliOptions, TapDocument } from "../src/ir/types.js";
import { renderMarkdown } from "../src/renderer/markdown.js";

const options: CliOptions = {
  failOnly: false,
  strict: false,
  help: false,
  version: false,
};

describe("renderMarkdown", () => {
  test("renders failing diagnostics without emoji", () => {
    const document: TapDocument = {
      tests: [
        {
          id: 1,
          name: "works",
          ok: false,
          diagnostics: [{ raw: "message: no" }],
          comments: [],
          children: [],
        },
      ],
      comments: [],
      warnings: [],
      raw: "",
    };

    const markdown = renderMarkdown(document, options);
    expect(markdown).toContain("- works **(FAIL)**");
    expect(markdown).toContain("  > message: no");
    expect(markdown).not.toContain("```yaml");
  });
});
