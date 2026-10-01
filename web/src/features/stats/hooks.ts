"use client";

import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/providers/api-provider";

import { statsQueries } from "./api";

export function useTrackerStats(trackerId: number) {
  const api = useApi();
  return useQuery(statsQueries.tracker(api.stats, trackerId));
}
