"use client";

import { useRef, type ReactNode } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "./button";

/**
 * A button that asks for confirmation in a native <dialog> (focus trap, Esc to close
 * and backdrop handled by the browser) before running `onConfirm`.
 */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  size = "md",
  loading,
  onConfirm,
}: {
  children: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant={variant} size={size} loading={loading} onClick={() => dialog.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[3px] border border-ink-rule bg-surface p-6 text-fg backdrop:bg-black/40"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <h2 id="confirm-title" className="display text-2xl">
          {title}
        </h2>
        {description && <div className="mt-2 text-sm text-fg-muted">{description}</div>}
        <form method="dialog" className="mt-6 flex justify-end gap-2">
          <Button type="submit" variant="secondary" size="sm">
            Cancel
          </Button>
          <Button type="submit" variant={variant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </form>
      </dialog>
    </>
  );
}
