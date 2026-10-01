import { create } from "zustand";

/** A "Run now" in flight: we poll until each engine has produced a snapshot newer than `baselineId`. */
export type ActiveRun = {
  engines: string[];
  baselineId: number;
  startedAt: number;
};

type RunState = {
  runs: Record<number, ActiveRun>;
  start: (trackerId: number, run: ActiveRun) => void;
  finish: (trackerId: number) => void;
};

export const useRunStore = create<RunState>()((set) => ({
  runs: {},
  start: (trackerId, run) => set((s) => ({ runs: { ...s.runs, [trackerId]: run } })),
  finish: (trackerId) =>
    set((s) => {
      const runs = { ...s.runs };
      delete runs[trackerId];
      return { runs };
    }),
}));

export const useActiveRun = (trackerId: number) => useRunStore((s) => s.runs[trackerId]);
