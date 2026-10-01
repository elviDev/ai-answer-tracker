import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

/** Must match the key read by ThemeScript before hydration. */
export const PREFERENCES_STORAGE_KEY = "aat-preferences";

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme }) => ({ theme }),
    },
  ),
);
