import type { Metadata } from "next";

import { Panel } from "@/components/ui/card";
import { TrackerForm } from "@/features/trackers/components/tracker-form";

export const metadata: Metadata = { title: "New tracker" };

export default function NewTrackerPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[18rem_1fr]">
      <div>
        <p className="eyebrow">New tracker</p>
        <h1 className="display mt-2 text-5xl text-fg">Ask a question.</h1>
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">
          Write it the way a customer would ask an AI assistant. We’ll ask every engine you pick, on a schedule, and
          measure how your brand shows up in each answer.
        </p>
      </div>
      <Panel>
        <TrackerForm />
      </Panel>
    </div>
  );
}
