import { describe, expect, test } from "bun:test";
import { parseTap } from "../src/parser/tapParserAdapter.js";

describe("parseTap", () => {
  test("parses nested subtests", async () => {
    const tap = await Bun.file("tests/fixtures/nested-subtest.tap").text();
    const document = await parseTap(tap);

    expect(document.version).toBe(14);
    expect(document.tests).toHaveLength(1);
    expect(document.tests[0]?.children[0]?.name).toBe("GET /health");
    expect(document.tests[0]?.children[1]?.name).toBe("POST /items");
    expect(document.tests[0]?.children[1]?.diagnostics[0]?.raw).toContain("expected 201");
  });

  test("parses diagnostics", async () => {
    const tap = await Bun.file("tests/fixtures/failing.tap").text();
    const document = await parseTap(tap);

    expect(document.tests[1]?.ok).toBe(false);
    expect(document.tests[1]?.diagnostics[0]?.raw).toContain("permission denied");
  });
});
