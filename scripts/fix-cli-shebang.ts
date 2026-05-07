import { readFile, writeFile } from "node:fs/promises";

const cliPath = "dist/cli.js";
const source = await readFile(cliPath, "utf8");
const lines = source.split("\n");
const firstCodeLine = lines.findIndex((line) => !line.startsWith("#!") && line !== "// @bun");

if (firstCodeLine === -1) {
  throw new Error(`could not find JavaScript body in ${cliPath}`);
}

await writeFile(cliPath, `#!/usr/bin/env node\n${lines.slice(firstCodeLine).join("\n")}`);
