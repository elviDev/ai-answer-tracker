"use client";

import { cn } from "@/lib/utils/cn";
import { useToastStore, type ToastTone } from "@/stores/toast-store";

const tones: Record<ToastTone, string> = {
  info: "border-l-fg",
  success: "border-l-good",
  error: "border-l-bad",
};

const icons: Record<ToastTone, string> = { info: "•", success: "✓", error: "!" };

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-[3px] border border-line border-l-[3px] bg-surface px-4 py-3 text-sm text-fg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]",
            tones[t.tone],
          )}
        >
          <span aria-hidden className={cn("font-bold", t.tone === "error" ? "text-bad" : t.tone === "success" ? "text-good" : "text-accent")}>
            {icons[t.tone]}
          </span>
          <p className="flex-1">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="text-fg-subtle hover:text-fg" aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
