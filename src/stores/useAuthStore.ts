// src/stores/useAuthStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthStore } from "../types/zustand";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      unsetAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
