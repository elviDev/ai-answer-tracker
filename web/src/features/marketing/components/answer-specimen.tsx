import { HighlightedText } from "@/components/ui/highlighted-text";

/**
 * The product, shown rather than described: one AI answer as the tracker reads it,
 * with the brand marked, competitors underlined and the measurements in the margin.
 * Clearly labelled as an example; no fabricated customer data.
 */
const answer =
  "For most early-stage teams, Notion is the strongest all-round pick: docs, wiki and lightweight " +
  "project tracking live in one workspace. Obsidian suits founders who want local, private notes, " +
  "and Coda is worth a look if your notes double as internal tools. If you already live in Google " +
  "Workspace, Notion still integrates cleanly with Drive and Calendar.";

const readings = [
  { label: "Mentioned", value: "2×", note: "first in sentence one" },
  { label: "Rank", value: "1 of 4", note: "ahead of Obsidian, Coda" },
  { label: "Cited", value: "notion.com", note: "1 of 3 sources" },
  { label: "Changed", value: "23%", note: "similar to yesterday" },
];

export function AnswerSpecimen() {
  return (
    <figure className="border border-ink-rule bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink-rule px-5 py-2.5">
        <span className="eyebrow text-fg">Specimen</span>
        <span className="eyebrow">Gemini · grounded</span>
        <span className="eyebrow ml-auto">Example</span>
      </div>
      <div className="grid md:grid-cols-[1fr_13rem]">
        <div className="p-5 sm:p-6">
          <p className="eyebrow mb-3">Prompt</p>
          <p className="display text-2xl text-fg-muted italic">“What’s the best note-taking app for a startup?”</p>
          <p className="eyebrow mt-6 mb-3">Answer</p>
          <p className="text-lg leading-8 text-fg">
            <HighlightedText text={answer} brand={["Notion"]} competitors={["Obsidian", "Coda", "Evernote"]} />
          </p>
        </div>
        <dl className="grid grid-cols-2 border-t border-line md:grid-cols-1 md:border-t-0 md:border-l">
          {readings.map((r, i) => (
            <div key={r.label} className={`px-5 py-4 ${i > 0 ? "border-line md:border-t" : ""} ${i % 2 ? "border-l md:border-l-0" : ""} ${i > 1 ? "border-t" : ""}`}>
              <dt className="eyebrow">{r.label}</dt>
              <dd className="mt-1 font-mono text-lg text-fg tabular-nums">{r.value}</dd>
              <dd className="text-xs text-fg-subtle">{r.note}</dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-2.5 text-xs text-fg-subtle">
        <span className="flex items-center gap-1.5">
          <mark className="rounded-[2px] bg-mark px-1 text-mark-fg">Notion</mark> your brand
        </span>
        <span className="flex items-center gap-1.5">
          <span className="underline decoration-dotted underline-offset-[3px]">Obsidian</span> a competitor
        </span>
      </figcaption>
    </figure>
  );
}
