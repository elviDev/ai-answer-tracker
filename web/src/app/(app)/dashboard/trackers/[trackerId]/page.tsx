import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { snapshotQueries } from "@/features/snapshots/api";
import { statsQueries } from "@/features/stats/api";
import { trackerQueries } from "@/features/trackers/api";
import { TrackerDetail } from "@/features/trackers/components/tracker-detail";
import { createApiClients } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/http";
import { serverHttp } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import { prefetch } from "@/lib/query/prefetch";

const idSchema = z.coerce.number().int().positive();

/** One fetch per request, shared by generateMetadata and the page. Unknown ids become a 404. */
const loadTracker = cache(async (rawId: string) => {
  const id = idSchema.safeParse(rawId);
  if (!id.success) notFound();
  try {
    return await createApiClients(serverHttp()).trackers.get(id.data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<"/dashboard/trackers/[trackerId]">): Promise<Metadata> {
  const { trackerId } = await params;
  await requireSession();
  const tracker = await loadTracker(trackerId);
  return { title: tracker.name };
}

export default async function TrackerPage({ params }: PageProps<"/dashboard/trackers/[trackerId]">) {
  const { trackerId } = await params;
  await requireSession(`/dashboard/trackers/${trackerId}`);
  const tracker = await loadTracker(trackerId);

  const { state } = await prefetch((client, api) => {
    client.setQueryData(trackerQueries.detail(api.trackers, tracker.id).queryKey, tracker);
    return Promise.all([
      client.prefetchQuery(statsQueries.tracker(api.stats, tracker.id)),
      client.prefetchQuery(snapshotQueries.list(api.snapshots, tracker.id)),
    ]);
  });

  return (
    <HydrationBoundary state={state}>
      <TrackerDetail trackerId={tracker.id} />
    </HydrationBoundary>
  );
}
