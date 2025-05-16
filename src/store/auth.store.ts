// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/api/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;

  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({ user, isAuthenticated: true, token, refreshToken }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage", // نام در localStorage
      partialize: (state) => ({
        // فقط این فیلدها در localStorage ذخیره می‌شوند
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
