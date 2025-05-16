// src/api/services/notifications-service.ts
import axios from "@/lib/axios";
import {
  Notification,
  NotificationFilters,
  SendNotificationRequest,
  SendNotificationResponse,
  PaginatedNotifications,
} from "@/api/types/notifications.types";

export const notificationsService = {
  /**
   * دریافت اطلاعیه‌های کاربر جاری
   * @param filters فیلترهای جستجو
   */
  getCurrentUserNotifications: async (
    filters?: NotificationFilters
  ): Promise<PaginatedNotifications> => {
    const response = await axios.get("/notifications/me", { params: filters });
    return response.data;
  },

  /**
   * علامت‌گذاری اطلاعیه به عنوان خوانده شده
   * @param notificationId شناسه اطلاعیه
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await axios.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * علامت‌گذاری همه اطلاعیه‌ها به عنوان خوانده شده
   */
  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    const response = await axios.post("/notifications/read-all");
    return response.data;
  },

  /**
   * دریافت همه اطلاعیه‌ها (ادمین)
   * @param filters فیلترهای جستجو
   */
  getAllNotifications: async (
    filters?: NotificationFilters & { userId?: string; planId?: string }
  ): Promise<PaginatedNotifications> => {
    const response = await axios.get("/notifications", { params: filters });
    return response.data;
  },

  /**
   * ارسال اطلاعیه (ادمین)
   * @param data اطلاعات اطلاعیه جدید
   */
  sendNotification: async (
    data: SendNotificationRequest
  ): Promise<SendNotificationResponse> => {
    const response = await axios.post("/notifications/send", data);
    return response.data;
  },
};
