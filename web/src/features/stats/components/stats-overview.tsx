"use client";

import dynamic from "next/dynamic";

import { Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngines } from "@/features/engines/hooks";
import { sortByRegistry } from "@/features/engines/lib/engine-color";

import { useTrackerStats } from "../hooks";
import { EngineStatTiles } from "./engine-stat-tiles";

// Recharts is heavy and client-only: load it after the page is interactive.
const MentionRateChart = dynamic(() => import("./mention-rate-chart").then((m) => m.MentionRateChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />,
});

export function StatsOverview({ trackerId }: { trackerId: number }) {
  const { data: stats, isPending, isError, error } = useTrackerStats(trackerId);
  const { data: engines } = useEngines();

  if (isPending) return <Skeleton className="h-48" />;
  if (isError) return <p className="text-sm text-bad">Couldn’t load stats: {error.message}</p>;
  if (!stats.engines.length) {
    return (
      <EmptyState
        title="No readings yet."
        description="Run the tracker to ask the engines now, or wait for the schedule. Every answer is stored and measured here."
      />
    );
  }

  const ordered = sortByRegistry(stats.engines, engines, (s) => s.engine);
  return (
    <>
      <Section title="§ Readings by engine">
        <EngineStatTiles stats={ordered} engines={engines} />
      </Section>
      <Section title="§ Mention rate over time" aside={<span className="text-xs text-fg-subtle">Share of each day’s answers naming {stats.brand}</span>}>
        <MentionRateChart stats={ordered} engines={engines} />
      </Section>
    </>
  );
}
