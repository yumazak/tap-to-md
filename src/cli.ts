#!/usr/bin/env bun
import { parseArgs, printHelp, versionText } from "./config.js";
import { isKnownError, StrictError } from "./errors.js";
import { readInput, writeOutput } from "./io.js";
import { parseTap } from "./parser/tapParserAdapter.js";
import { renderMarkdown } from "./renderer/markdown.js";

async function main(argv: string[]): Promise<number> {
  const options = parseArgs(argv);
  if (options.help) {
    await writeOutput(`${printHelp()}\n`);
    return 0;
  }
  if (options.version) {
    await writeOutput(`${versionText()}\n`);
    return 0;
  }

  const tapText = await readInput(options.input);
  const document = await parseTap(tapText);
  if (options.strict && document.warnings.length > 0) {
    throw new StrictError(document.warnings.map((warning) => warning.message).join("\n"));
  }
  for (const warning of document.warnings) {
    console.error(warning.message);
  }
  const markdown = renderMarkdown(document, options);
  await writeOutput(markdown, options.output);
  return 0;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = isKnownError(error) ? error.exitCode : 1;
  });
