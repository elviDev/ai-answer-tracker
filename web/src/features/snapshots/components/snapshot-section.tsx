"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Section } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngines } from "@/features/engines/hooks";
import { useTracker } from "@/features/trackers/hooks";

import { useSnapshots } from "../hooks";
import { SnapshotTable } from "./snapshot-table";

/** Engine filter lives in the URL (?engine=…) so filtered views are shareable and survive reloads. */
function useEngineFilter() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const engine = params.get("engine") ?? undefined;
  const setEngine = (next: string | undefined) => {
    const search = new URLSearchParams(params);
    if (next) search.set("engine", next);
    else search.delete("engine");
    router.replace(`${pathname}${search.size ? `?${search}` : ""}`, { scroll: false });
  };
  return [engine, setEngine] as const;
}

export function SnapshotSection({ trackerId }: { trackerId: number }) {
  const [engine, setEngine] = useEngineFilter();
  const { data: tracker } = useTracker(trackerId);
  const { data: engines } = useEngines();
  const { data: snapshots, isPending, isFetching } = useSnapshots(trackerId, engine ? { engine } : {});
  const label = (name: string) => engines?.find((e) => e.name === name)?.label ?? name;

  return (
    <Section
      title="§ Answers"
      aside={
        <>
          {isFetching && !isPending && <span className="eyebrow">Updating…</span>}
          <label className="flex items-center gap-2">
            <span className="eyebrow">Engine</span>
            <select
              value={engine ?? ""}
              onChange={(e) => setEngine(e.target.value || undefined)}
              className="h-8 rounded-[3px] border border-line bg-surface px-2 text-sm text-fg hover:border-fg/40 focus:border-fg focus:outline-none"
            >
              <option value="">All engines</option>
              {tracker?.engines.map((name) => (
                <option key={name} value={name}>
                  {label(name)}
                </option>
              ))}
            </select>
          </label>
        </>
      }
    >
      {isPending || !tracker ? (
        <Skeleton className="h-40" />
      ) : (
        <SnapshotTable snapshots={snapshots ?? []} tracker={tracker} engineLabel={label} />
      )}
    </Section>
  );
}
