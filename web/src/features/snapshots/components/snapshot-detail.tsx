import { HighlightedText } from "@/components/ui/highlighted-text";
import type { Tracker } from "@/features/trackers/schemas";

import type { Snapshot } from "../schemas";

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Where in the answer the brand first appears, in words a person reads. */
function positionLabel(offset: number | null) {
  if (offset == null) return "Not mentioned";
  if (offset < 0.15) return "Opening";
  if (offset < 0.5) return "First half";
  return "Second half";
}

export function SnapshotDetail({ snapshot, tracker }: { snapshot: Snapshot; tracker: Tracker }) {
  if (snapshot.status !== "success") {
    return (
      <div className="border-l-2 border-bad pl-4">
        <p className="eyebrow text-bad">{snapshot.status === "no_answer" ? "No answer" : "Error"}</p>
        <p className="mt-2 font-mono text-xs whitespace-pre-wrap text-fg-muted">{snapshot.error}</p>
      </div>
    );
  }

  const competitors = Object.entries(snapshot.competitor_mentions).sort((a, b) => b[1] - a[1]);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_17rem]">
      <div>
        <p className="eyebrow mb-3">Answer</p>
        <p className="max-w-prose text-[15px] leading-7 whitespace-pre-wrap text-fg">
          <HighlightedText text={snapshot.answer_text ?? ""} brand={[tracker.brand, ...tracker.aliases]} competitors={tracker.competitors} />
        </p>
      </div>

      <aside className="flex flex-col gap-6 border-t border-line pt-5 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
          <dt className="text-fg-subtle">First mention</dt>
          <dd className="text-right text-fg">{positionLabel(snapshot.first_mention_offset)}</dd>
          <dt className="text-fg-subtle">Answered in</dt>
          <dd className="text-right text-fg tabular-nums">{(snapshot.duration_ms / 1000).toFixed(1)}s</dd>
        </dl>

        {competitors.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Competitors</p>
            <ul className="space-y-1 font-mono text-xs">
              {competitors.map(([name, count]) => (
                <li key={name} className="flex justify-between">
                  <span className={count ? "text-fg" : "text-fg-subtle"}>{name}</span>
                  <span className="tabular-nums text-fg-muted">{count}×</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="eyebrow mb-2">Sources · {snapshot.sources.length}</p>
          {snapshot.sources.length ? (
            <ol className="space-y-2">
              {snapshot.sources.map((source, i) => (
                <li key={source.url} className="grid grid-cols-[1.25rem_1fr] text-xs">
                  <span className="font-mono text-fg-subtle">{i + 1}</span>
                  <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="min-w-0 break-words text-fg hover:text-accent">
                    {source.title || hostname(source.url)}
                    <span className="block font-mono text-[11px] text-fg-subtle">{hostname(source.url)}</span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-fg-subtle">This engine returned no sources.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
