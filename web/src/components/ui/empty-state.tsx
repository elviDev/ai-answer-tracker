import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2 border-t border-ink-rule py-10", className)}>
      <p className="display text-3xl text-fg">{title}</p>
      {description && <p className="max-w-lg text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
