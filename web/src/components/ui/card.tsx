import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** A ruled section: ink rule on top, eyebrow title, optional aside. No boxes, no shadows. */
export function Section({
  title,
  aside,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "title"> & { title: ReactNode; aside?: ReactNode }) {
  return (
    <section className={cn("border-t border-ink-rule pt-3", className)} {...props}>
      <header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className="eyebrow text-fg">{title}</h2>
        {aside && <div className="ml-auto flex items-center gap-3">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** Bordered panel for forms and dialogs. */
export function Panel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[3px] border border-line bg-surface p-6", className)} {...props} />;
}
