import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toaster";
import { engineQueries } from "@/features/engines/api";
import { trackerQueries } from "@/features/trackers/api";
import { requireSession } from "@/lib/auth/session";
import { prefetch } from "@/lib/query/prefetch";
import { ApiProvider } from "@/providers/api-provider";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  await requireSession("/dashboard");

  // Shared by every dashboard page (sidebar + forms), so prefetch once at the layout.
  const { state } = await prefetch((client, api) =>
    Promise.all([
      client.prefetchQuery(trackerQueries.list(api.trackers)),
      client.prefetchQuery(engineQueries.list(api.engines)),
    ]),
  );

  return (
    <QueryProvider>
      <ApiProvider>
        <HydrationBoundary state={state}>
          <AppShell>{children}</AppShell>
        </HydrationBoundary>
        <Toaster />
      </ApiProvider>
    </QueryProvider>
  );
}
