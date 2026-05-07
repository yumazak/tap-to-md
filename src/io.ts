import { readFile, writeFile } from "node:fs/promises";

export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function readInput(path?: string): Promise<string> {
  if (!path) {
    return await readStdin();
  }
  return await readFile(path, "utf8");
}

export async function writeOutput(markdown: string, path?: string): Promise<void> {
  if (!path) {
    process.stdout.write(markdown);
    return;
  }
  await writeFile(path, markdown);
}
