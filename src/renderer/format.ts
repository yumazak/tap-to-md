export function escapeTableCell(value: string | number | boolean | undefined): string {
  return String(value ?? "")
    .replaceAll("\r", " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function stripControlChars(text: string): string {
  let result = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 0x09 || code === 0x0a) {
      result += ch;
      continue;
    }
    if (code <= 0x1f) {
      continue;
    }
    result += ch;
  }
  return result;
}

export function heading(level: number, text: string): string {
  const sanitized = stripControlChars(text.replace(/\r?\n+/g, " ")).replace(
    /^#+/,
    (match) => `\\${match}`,
  );
  return `${"#".repeat(level)} ${sanitized}`;
}

export function statusText(ok: boolean, skip?: string | boolean, todo?: string | boolean): string {
  if (skip) {
    return "SKIP";
  }
  if (todo) {
    return "TODO";
  }
  return ok ? "PASS" : "FAIL";
}

export function fenced(value: string, language = "text"): string {
  const fence = value.includes("```") ? "````" : "```";
  return `${fence}${language}\n${value.trimEnd()}\n${fence}`;
}

export function truncateBytes(value: string, maxBytes?: number): string {
  if (maxBytes === undefined) {
    return value;
  }
  const bytes = new TextEncoder().encode(value);
  if (bytes.length <= maxBytes) {
    return value;
  }
  let end = maxBytes;
  while (end > 0 && ((bytes[end] ?? 0) & 0xc0) === 0x80) {
    end -= 1;
  }
  const sliced = new TextDecoder().decode(bytes.slice(0, end));
  return `${sliced}\n[truncated to ${maxBytes} bytes]`;
}
