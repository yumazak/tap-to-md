import { describe, expect, test } from "bun:test";
import type { TapDocument } from "../src/ir/types.js";
import { summarize } from "../src/ir/summary.js";

describe("summarize", () => {
  test("counts pass, fail, skip, and todo recursively", () => {
    const document: TapDocument = {
      tests: [
        {
          id: 1,
          name: "parent",
          ok: true,
          diagnostics: [],
          comments: [],
          children: [
            {
              id: 1,
              name: "child pass",
              ok: true,
              diagnostics: [],
              comments: [],
              children: [],
            },
            {
              id: 2,
              name: "child fail",
              ok: false,
              diagnostics: [],
              comments: [],
              children: [],
            },
            {
              id: 3,
              name: "child skip",
              ok: true,
              skip: "not supported",
              diagnostics: [],
              comments: [],
              children: [],
            },
            {
              id: 4,
              name: "child todo",
              ok: false,
              todo: "later",
              diagnostics: [],
              comments: [],
              children: [],
            },
          ],
        },
      ],
      comments: [],
      bailout: { reason: "stop" },
      warnings: [{ message: "invalid" }],
      raw: "",
    };

    expect(summarize(document)).toEqual({
      total: 5,
      passed: 3,
      failed: 2,
      skipped: 1,
      todo: 1,
      bailout: true,
      warnings: 1,
    });
  });
});
