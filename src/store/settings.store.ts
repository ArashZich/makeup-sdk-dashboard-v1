// src/store/settings.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface SettingsState {
  // تنظیمات ظاهری
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // تنظیمات اطلاع‌رسانی
  emailNotifications: boolean;
  smsNotifications: boolean;
  toggleEmailNotifications: () => void;
  toggleSmsNotifications: () => void;
  setNotificationSettings: (email: boolean, sms: boolean) => void;

  // سایر تنظیمات
  dashboardLayout: "default" | "compact" | "comfortable";
  setDashboardLayout: (layout: "default" | "compact" | "comfortable") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // تنظیمات ظاهری
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // تنظیمات اطلاع‌رسانی
      emailNotifications: true,
      smsNotifications: true,
      toggleEmailNotifications: () =>
        set((state) => ({ emailNotifications: !state.emailNotifications })),
      toggleSmsNotifications: () =>
        set((state) => ({ smsNotifications: !state.smsNotifications })),
      setNotificationSettings: (email, sms) =>
        set({ emailNotifications: email, smsNotifications: sms }),

      // سایر تنظیمات
      dashboardLayout: "default",
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
    }),
    {
      name: "user-settings", // نام در localStorage
    }
  )
);
