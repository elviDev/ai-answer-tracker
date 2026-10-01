import type { Metadata } from "next";

import { TrackerOverview } from "@/features/trackers/components/tracker-overview";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  // Data comes from the cache the layout prefetched on the server.
  return <TrackerOverview />;
}
