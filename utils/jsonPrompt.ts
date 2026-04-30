function normalizePotentialJsonInput(input: string) {
  return String(input || "")
    // Drop UTF-8 BOM and zero-width chars that frequently break JSON.parse.
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    // Normalize non-breaking and uncommon unicode spaces to plain space.
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    // Normalize unicode line separators to LF.
    .replace(/[\u2028\u2029]/g, "\n")
    .trim();
}

export function tryParseJsonPrompt(input: string): unknown | null {
  const raw = normalizePotentialJsonInput(input);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function tryFormatJsonPrompt(input: string): string | null {
  const parsed = tryParseJsonPrompt(input);
  if (!parsed || typeof parsed !== "object") return null;
  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

