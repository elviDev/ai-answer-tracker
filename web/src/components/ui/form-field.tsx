"use client";

import { createContext, use, useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FieldContext = { id: string; hintId: string; errorId: string; invalid: boolean };
const FieldCtx = createContext<FieldContext | null>(null);

/** Wires label, hint and error to the control via ids/aria so every field is accessible by default. */
export function FormField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  const ctx = { id, hintId: `${id}-hint`, errorId: `${id}-error`, invalid: Boolean(error) };
  return (
    <FieldCtx value={ctx}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="eyebrow text-fg-muted">
          {label}
        </label>
        {children}
        {hint && !error && (
          <p id={ctx.hintId} className="text-xs text-fg-subtle">
            {hint}
          </p>
        )}
        {error && (
          <p id={ctx.errorId} role="alert" className="text-xs text-bad">
            {error}
          </p>
        )}
      </div>
    </FieldCtx>
  );
}

/** aria/id props for the control inside the nearest FormField. */
export function useFieldProps() {
  const ctx = use(FieldCtx);
  if (!ctx) return {};
  return {
    id: ctx.id,
    "aria-invalid": ctx.invalid || undefined,
    "aria-describedby": ctx.invalid ? ctx.errorId : ctx.hintId,
  };
}

const controlClasses =
  "w-full rounded-[3px] border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle " +
  "transition-colors hover:border-fg/40 focus:border-fg focus:outline-none aria-invalid:border-bad";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-9", className)} {...useFieldProps()} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "min-h-20 resize-y", className)} {...useFieldProps()} {...props} />;
}
