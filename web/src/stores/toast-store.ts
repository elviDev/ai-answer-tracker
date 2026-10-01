import { create } from "zustand";

export type ToastTone = "info" | "success" | "error";

export type Toast = { id: number; tone: ToastTone; message: string };

type ToastState = {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;
const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message, tone = "info") => {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-3), { id, tone, message }] });
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Imperative helper for non-React code (mutation callbacks, query cache handlers). */
export const toast = {
  info: (message: string) => useToastStore.getState().push(message, "info"),
  success: (message: string) => useToastStore.getState().push(message, "success"),
  error: (message: string) => useToastStore.getState().push(message, "error"),
};
