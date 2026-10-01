import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { Spinner } from "./spinner";

const variants = {
  /** Ink on paper: the default action. */
  primary: "bg-fg text-canvas border-fg hover:bg-fg/85",
  /** Vermilion: reserved for the single most important action on a page. */
  accent: "bg-accent text-accent-fg border-accent hover:bg-accent-hover hover:border-accent-hover",
  secondary: "bg-transparent text-fg border-fg/25 hover:border-fg",
  ghost: "bg-transparent text-fg-muted border-transparent hover:text-fg hover:bg-surface-2",
  danger: "bg-transparent text-bad border-bad/40 hover:bg-bad hover:text-canvas hover:border-bad",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

/** Shared class recipe so links can look like buttons without becoming <button>s. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-[3px] border font-medium whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean };

export function Button({ variant, size, loading = false, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </button>
  );
}
