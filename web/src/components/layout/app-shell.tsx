import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { TrackerNav } from "@/features/trackers/components/tracker-nav";

import { Logo } from "./logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-ink-rule bg-canvas/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <Logo href="/dashboard" />
          <span className="eyebrow hidden border-l border-line pl-4 sm:inline">Dashboard</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="border-b border-line lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0">
          <div className="lg:sticky lg:top-14">
            <TrackerNav />
          </div>
        </aside>
        <main id="content" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
