import { highlightTerms } from "@/lib/text/highlight";

/** Answer text with the brand marked like a highlighter pen and competitors underlined. */
export function HighlightedText({ text, brand, competitors }: { text: string; brand: string[]; competitors: string[] }) {
  return (
    <>
      {highlightTerms(text, { brand, competitors }).map((segment, i) =>
        segment.kind === "brand" ? (
          <mark key={i} className="rounded-[2px] bg-mark px-0.5 text-mark-fg">
            {segment.text}
          </mark>
        ) : segment.kind === "competitor" ? (
          <span key={i} className="underline decoration-fg-subtle decoration-dotted decoration-1 underline-offset-[3px]">
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}
