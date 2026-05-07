import { describe, expect, test } from "bun:test";
import {
  escapeTableCell,
  fenced,
  heading,
  statusText,
  truncateBytes,
} from "../src/renderer/format.js";

describe("format helpers", () => {
  test("escapes table cells", () => {
    expect(escapeTableCell("a|b\\c\nnext")).toBe("a\\|b\\\\c<br>next");
    expect(escapeTableCell("a\rb")).toBe("a b");
  });

  test("truncates by bytes", () => {
    expect(truncateBytes("abcdef", 3)).toBe("abc\n[truncated to 3 bytes]");
    expect(truncateBytes("あいう", 4)).toBe("あ\n[truncated to 4 bytes]");
  });

  test("renders headings", () => {
    expect(heading(3, "Title")).toBe("### Title");
    expect(heading(3, "## Title\nnext\u0007")).toBe("### \\## Title next");
  });

  test("renders fenced blocks and expands fence when needed", () => {
    expect(fenced("a\n```", "yaml")).toBe("````yaml\na\n```\n````");
  });

  test("renders status text", () => {
    expect(statusText(true)).toBe("PASS");
    expect(statusText(false)).toBe("FAIL");
    expect(statusText(true, "reason")).toBe("SKIP");
    expect(statusText(false, false, "later")).toBe("TODO");
  });
});
