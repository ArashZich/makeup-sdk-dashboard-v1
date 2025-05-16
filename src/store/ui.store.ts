// src/store/ui.store.ts
import { create } from "zustand";

interface UIState {
  // سایدبار
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // مودال‌ها
  activeModal: string | null;
  modalData: any | null;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;

  // اطلاعیه‌ها
  hasUnreadNotifications: boolean;
  unreadNotificationsCount: number;
  setUnreadNotifications: (count: number) => void;
  markAllNotificationsAsRead: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // سایدبار
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // مودال‌ها
  activeModal: null,
  modalData: null,
  openModal: (modalId, data = null) =>
    set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // اطلاعیه‌ها
  hasUnreadNotifications: false,
  unreadNotificationsCount: 0,
  setUnreadNotifications: (count) =>
    set({
      unreadNotificationsCount: count,
      hasUnreadNotifications: count > 0,
    }),
  markAllNotificationsAsRead: () =>
    set({
      unreadNotificationsCount: 0,
      hasUnreadNotifications: false,
    }),
}));
