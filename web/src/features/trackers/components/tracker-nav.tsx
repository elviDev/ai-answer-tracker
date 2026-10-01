"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

import { usePrefetchTracker, useTrackers } from "../hooks";

const pad = (n: number) => String(n).padStart(2, "0");

export function TrackerNav() {
  const { data: trackers, isPending, isError } = useTrackers();
  const pathname = usePathname();
  const prefetch = usePrefetchTracker();

  return (
    <nav aria-label="Trackers" className="flex flex-col py-5">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-5">
        <Link href="/dashboard" className={cn("eyebrow hover:text-fg", pathname === "/dashboard" && "text-fg")}>
          Index{trackers ? ` · ${trackers.length}` : ""}
        </Link>
        <Link href="/dashboard/trackers/new" className="text-xs font-medium text-accent hover:text-accent-hover">
          + New tracker
        </Link>
      </div>

      <div className="mt-3 px-4 sm:px-6 lg:px-5">
        {isPending && <Skeleton className="h-24" />}
        {isError && <p className="text-sm text-bad">Couldn’t load trackers.</p>}
        {trackers?.length === 0 && <p className="text-sm text-fg-subtle">Nothing tracked yet.</p>}
      </div>

      <ul className="flex gap-1 overflow-x-auto px-4 sm:px-6 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
        {trackers?.map((tracker, i) => {
          const href = `/dashboard/trackers/${tracker.id}`;
          const active = pathname === href;
          return (
            <li key={tracker.id} className="min-w-52 lg:min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => prefetch(tracker.id)}
                onFocus={() => prefetch(tracker.id)}
                className={cn(
                  "grid grid-cols-[1.75rem_1fr] gap-x-1 border-l-2 border-transparent px-3 py-2.5 transition-colors hover:bg-surface-2 lg:px-5",
                  active && "border-accent bg-surface",
                )}
              >
                <span className="font-mono text-xs leading-5 text-fg-subtle">{pad(i + 1)}</span>
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm text-fg", active && "font-medium")}>{tracker.name}</span>
                  <span className="block truncate font-mono text-[11px] text-fg-subtle">
                    {tracker.brand}
                    {!tracker.active && " · paused"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
