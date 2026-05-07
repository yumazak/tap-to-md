import mri from "mri";
import type { CliOptions, Layout } from "./ir/types.js";
import { CliError } from "./errors.js";

const VERSION = "0.1.0";

export function versionText(): string {
  return `tap-to-md ${VERSION}`;
}

export function printHelp(): string {
  return `tap-to-md ${VERSION}

Usage:
  tap-to-md [options]

Options:
  -i, --input <file>          Input TAP file (default: stdin)
  -o, --output <file>         Output Markdown file (default: stdout)
  --layout <spec|summary>     Output layout (default: spec)
  --include-comments          Include TAP comments
  --include-raw               Include raw TAP
  --fail-only                 Include only failed tests
  --strict                    Exit 2 on parser warning or invalid TAP
  --max-diagnostics <bytes>   Limit diagnostics bytes
  --version                   Print version
  -h, --help                  Print help`;
}

const KNOWN_KEYS = new Set([
  "_",
  "i",
  "input",
  "o",
  "output",
  "h",
  "help",
  "layout",
  "include-comments",
  "include-raw",
  "fail-only",
  "strict",
  "max-diagnostics",
  "version",
]);

export function parseArgs(argv: string[]): CliOptions {
  const args = mri(argv, {
    alias: { i: "input", o: "output", h: "help" },
    boolean: [
      "include-comments",
      "include-raw",
      "fail-only",
      "strict",
      "version",
      "help",
    ],
    string: ["input", "output", "layout", "max-diagnostics"],
    default: { layout: "spec" },
  });

  for (const key of Object.keys(args)) {
    if (!KNOWN_KEYS.has(key)) {
      throw new CliError(`unknown option: --${key}`);
    }
  }

  if (args._.length > 0) {
    throw new CliError(`unexpected positional argument: ${String(args._[0])}`);
  }

  const layout = String(args.layout) as Layout;
  if (layout !== "spec" && layout !== "summary") {
    throw new CliError("--layout must be spec or summary");
  }

  let maxDiagnostics: number | undefined;
  if (args["max-diagnostics"] !== undefined) {
    maxDiagnostics = Number(args["max-diagnostics"]);
    if (!Number.isInteger(maxDiagnostics) || maxDiagnostics < 0) {
      throw new CliError("--max-diagnostics must be a non-negative integer");
    }
  }

  return {
    input: args.input ? String(args.input) : undefined,
    output: args.output ? String(args.output) : undefined,
    layout,
    includeComments: Boolean(args["include-comments"]),
    includeRaw: Boolean(args["include-raw"]),
    failOnly: Boolean(args["fail-only"]),
    strict: Boolean(args.strict),
    maxDiagnostics,
    version: Boolean(args.version),
    help: Boolean(args.help),
  };
}
