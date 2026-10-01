"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { engineColor } from "@/features/engines/lib/engine-color";
import type { Engine } from "@/features/engines/schemas";
import { formatShortDate } from "@/lib/utils/format";

import { dailyMentionRate } from "../lib/daily-mention-rate";
import type { EngineStats } from "../schemas";

const dayLabel = (day: string) => formatShortDate(new Date(`${day}T00:00:00`));

export function MentionRateChart({ stats, engines }: { stats: EngineStats[]; engines: Engine[] | undefined }) {
  const data = useMemo(() => dailyMentionRate(stats), [stats]);
  const label = (name: string) => engines?.find((e) => e.name === name)?.label ?? name;

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-fg-subtle">No successful answers yet.</p>;
  }

  return (
    <div>
      {stats.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted" aria-label="Legend">
          {stats.map((s) => (
            <li key={s.engine} className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5" style={{ background: engineColor(engines, s.engine) }} />
              {label(s.engine)}
            </li>
          ))}
        </ul>
      )}
      <div className="h-64" role="img" aria-label="Line chart of daily brand mention rate per engine">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="day" tickFormatter={dayLabel} tick={{ fill: "var(--fg-subtle)", fontSize: 11, fontFamily: "var(--font-geist-mono)" }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: "var(--fg-subtle)", fontSize: 11, fontFamily: "var(--font-geist-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} label={props.label} nameOf={label} />} cursor={{ stroke: "var(--fg-subtle)", strokeDasharray: "3 3" }} />
            {stats.map((s) => (
              <Line
                key={s.engine}
                dataKey={s.engine}
                name={s.engine}
                type="linear"
                stroke={engineColor(engines, s.engine)}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)", fill: engineColor(engines, s.engine) }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--surface)" }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  nameOf,
}: Partial<TooltipContentProps<ValueType, NameType>> & { nameOf: (name: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[3px] border border-ink-rule bg-surface px-3 py-2 text-xs">
      <p className="eyebrow mb-1 text-fg">{dayLabel(String(label))}</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="flex items-center gap-2 text-fg-muted">
          <span aria-hidden className="size-2" style={{ background: item.color }} />
          {nameOf(String(item.dataKey))}: <span className="font-medium text-fg tabular-nums">{item.value}%</span>
        </p>
      ))}
    </div>
  );
}
