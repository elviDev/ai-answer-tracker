"use client";

import { cn } from "@/lib/utils/cn";

import type { Engine } from "../schemas";

const GROUPS: { title: string; match: (e: Engine) => boolean }[] = [
  { title: "Official APIs", match: (e) => !e.requires_browser && e.name !== "mock" },
  { title: "Browser scraping", match: (e) => e.requires_browser },
  { title: "Testing", match: (e) => e.name === "mock" },
];

/** Controlled multi-select of engines, grouped by kind; unavailable engines are shown but disabled. */
export function EnginePicker({
  engines,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  engines: Engine[];
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const toggle = (name: string, checked: boolean) =>
    onChange(checked ? [...value, name] : value.filter((v) => v !== name));

  return (
    <div className="flex flex-col gap-4" aria-describedby={describedBy} aria-invalid={invalid || undefined}>
      {GROUPS.map((group) => {
        const items = engines.filter(group.match);
        if (!items.length) return null;
        return (
          <fieldset key={group.title}>
            <legend className="eyebrow mb-2">{group.title}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((engine) => (
                <label
                  key={engine.name}
                  title={engine.unavailable_reason ?? undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[3px] border border-line bg-surface px-3 py-2 text-sm transition-colors",
                    engine.available ? "cursor-pointer hover:border-fg/40" : "cursor-not-allowed opacity-55",
                    value.includes(engine.name) && "border-fg",
                  )}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-(--fg)"
                    checked={value.includes(engine.name)}
                    disabled={!engine.available}
                    onChange={(e) => toggle(engine.name, e.target.checked)}
                  />
                  <span className="flex-1 text-fg">{engine.label}</span>
                  {!engine.available && <span className="font-mono text-[10px] tracking-wide text-fg-subtle uppercase">no key</span>}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** Sensible default: available API engines if any key is set, otherwise the browser engines. */
export function defaultEngineSelection(engines: Engine[]) {
  const api = engines.filter((e) => e.available && !e.requires_browser && e.name !== "mock");
  return (api.length ? api : engines.filter((e) => e.available && e.requires_browser)).map((e) => e.name);
}
