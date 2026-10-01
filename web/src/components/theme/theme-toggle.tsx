"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";
import { usePreferencesStore, type ThemePreference } from "@/stores/preferences-store";

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light theme", icon: "☀" },
  { value: "system", label: "System theme", icon: "◐" },
  { value: "dark", label: "Dark theme", icon: "☾" },
];

const resolve = (theme: ThemePreference) =>
  theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;

/** Applies the saved preference and follows OS changes while on "system". */
function useApplyTheme(theme: ThemePreference) {
  useEffect(() => {
    const apply = () => (document.documentElement.dataset.theme = resolve(theme));
    apply();
    if (theme !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  useApplyTheme(theme);

  return (
    <div role="radiogroup" aria-label="Color theme" className={cn("inline-flex rounded-[3px] border border-line p-0.5", className)}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={theme === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => setTheme(option.value)}
          className={cn(
            "grid size-7 place-items-center rounded-[2px] text-sm text-fg-subtle transition-colors hover:text-fg",
            theme === option.value && "bg-surface-2 text-fg",
          )}
        >
          <span aria-hidden>{option.icon}</span>
        </button>
      ))}
    </div>
  );
}
