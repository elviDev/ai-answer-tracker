"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { useApi } from "@/providers/api-provider";

import { engineQueries } from "./api";

export function useEngines() {
  const api = useApi();
  return useQuery(engineQueries.list(api.engines));
}

/** Engine name -> display label, falling back to the raw name while loading. */
export function useEngineLabel() {
  const { data } = useEngines();
  return useCallback((name: string) => data?.find((e) => e.name === name)?.label ?? name, [data]);
}
