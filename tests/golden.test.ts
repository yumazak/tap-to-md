import { describe, expect, test } from "bun:test";
import { parseTap } from "../src/parser/tapParserAdapter.js";
import { renderMarkdown } from "../src/renderer/markdown.js";

describe("golden", () => {
  const specOptions = {
    failOnly: false,
    strict: false,
    help: false,
    version: false,
  };

  test("renders failing fixture", async () => {
    const tap = await Bun.file("tests/fixtures/failing.tap").text();
    const expected = await Bun.file("tests/golden/failing.md").text();
    const markdown = renderMarkdown(await parseTap(tap), specOptions);

    expect(markdown.trimEnd()).toBe(expected.trimEnd());
  });

  test("renders bailout fixture", async () => {
    const tap = await Bun.file("tests/fixtures/bailout.tap").text();
    const expected = await Bun.file("tests/golden/bailout.md").text();
    const markdown = renderMarkdown(await parseTap(tap), specOptions);

    expect(markdown.trimEnd()).toBe(expected.trimEnd());
  });

  test("renders nested subtest fixture", async () => {
    const tap = await Bun.file("tests/fixtures/nested-subtest.tap").text();
    const expected = await Bun.file("tests/golden/nested-subtest.md").text();
    const markdown = renderMarkdown(await parseTap(tap), specOptions);

    expect(markdown.trimEnd()).toBe(expected.trimEnd());
  });

  test("renders passed-only fixture", async () => {
    const tap = await Bun.file("tests/fixtures/simple.tap").text();
    const expected = await Bun.file("tests/golden/simple.md").text();
    const markdown = renderMarkdown(await parseTap(tap), {
      ...specOptions,
    });

    expect(markdown.trimEnd()).toBe(expected.trimEnd());
  });

  test("renders real vitest --reporter=tap output (spec)", async () => {
    const tap = await Bun.file("tests/fixtures/vitest-real.tap").text();
    const expected = await Bun.file("tests/golden/vitest-real.md").text();
    const markdown = renderMarkdown(await parseTap(tap), {
      ...specOptions,
    });

    expect(markdown.trimEnd()).toBe(expected.trimEnd());
  });

});
