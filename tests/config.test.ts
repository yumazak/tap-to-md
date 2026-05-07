import { describe, expect, test } from "bun:test";
import { parseArgs } from "../src/config.js";
import { CliError } from "../src/errors.js";

describe("parseArgs", () => {
  test("parses summary layout", () => {
    expect(parseArgs(["--layout", "summary"]).layout).toBe("summary");
  });

  test("rejects unknown flags", () => {
    expect(() => parseArgs(["--xxx"])).toThrow(CliError);
  });

  test("rejects negative max diagnostics", () => {
    expect(() => parseArgs(["--max-diagnostics", "-1"])).toThrow(CliError);
  });

  test("parses max diagnostics as number", () => {
    expect(parseArgs(["--max-diagnostics", "100"]).maxDiagnostics).toBe(100);
  });
});
