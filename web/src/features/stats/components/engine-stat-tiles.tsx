import { engineColor } from "@/features/engines/lib/engine-color";
import type { Engine } from "@/features/engines/schemas";
import { formatPercent } from "@/lib/utils/format";

import type { EngineStats } from "../schemas";

/** One ruled column per engine: headline mention rate, then the supporting readings. */
export function EngineStatTiles({ stats, engines }: { stats: EngineStats[]; engines: Engine[] | undefined }) {
  const label = (name: string) => engines?.find((e) => e.name === name)?.label ?? name;
  return (
    <ul className="grid border-t border-ink-rule sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <li key={s.engine} className="border-b border-line py-5 sm:border-r sm:px-5 sm:first:pl-0 xl:[&:nth-child(4n)]:border-r-0">
          <p className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 shrink-0" style={{ background: engineColor(engines, s.engine) }} />
            <span className="eyebrow text-fg">{label(s.engine)}</span>
          </p>
          <p className="display mt-3 text-6xl text-fg tabular-nums">{formatPercent(s.mention_rate)}</p>
          <p className="mt-1 text-xs text-fg-subtle">of answers mention the brand</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 font-mono text-xs">
            <dt className="text-fg-subtle">Avg rank</dt>
            <dd className="text-right text-fg tabular-nums">{s.avg_rank ?? "–"}</dd>
            <dt className="text-fg-subtle">Cited</dt>
            <dd className="text-right text-fg tabular-nums">{formatPercent(s.citation_rate)}</dd>
            <dt className="text-fg-subtle">Runs ok</dt>
            <dd className="text-right text-fg tabular-nums">
              {s.successful_runs}/{s.total_runs}
            </dd>
            <dt className="text-fg-subtle">Changes</dt>
            <dd className="text-right text-fg tabular-nums">{s.changes}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
