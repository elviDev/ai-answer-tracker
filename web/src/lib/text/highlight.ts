export type SegmentKind = "brand" | "competitor";
export type Segment = { text: string; kind?: SegmentKind };

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits text into plain and highlighted segments. Matching mirrors the backend's analysis
 * (whole word, case-insensitive, longest term first), so what's highlighted is what was counted.
 */
export function highlightTerms(text: string, terms: { brand: string[]; competitors: string[] }): Segment[] {
  const kinds = new Map<string, SegmentKind>();
  for (const term of terms.competitors) if (term.trim()) kinds.set(term.trim().toLowerCase(), "competitor");
  for (const term of terms.brand) if (term.trim()) kinds.set(term.trim().toLowerCase(), "brand");
  if (!text || !kinds.size) return [{ text }];

  const alternatives = [...kinds.keys()].sort((a, b) => b.length - a.length).map(escape).join("|");
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternatives})(?![\\p{L}\\p{N}_])`, "giu");

  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index;
    if (start > cursor) segments.push({ text: text.slice(cursor, start) });
    segments.push({ text: match[0], kind: kinds.get(match[0].toLowerCase()) });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
