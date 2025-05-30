// src/api/types/notifications.types.ts
import { PaginatedResponse } from "@/types/common.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";

// نوع اطلاعیه
export type NotificationType = "expiry" | "payment" | "system" | "other";

// مدل اطلاعیه
export interface Notification {
  _id: string;
  userId: string | User;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  planId?: string | Plan;
  metadata?: Record<string, any>;
  createdAt: string;
}

// فیلترهای جستجوی اطلاعیه‌ها
export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// مدل درخواست ارسال اطلاعیه (ادمین) - به‌روزرسانی شده
export interface SendNotificationRequest {
  userId?: string;
  planId?: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
  sendSms?: boolean;
  sendEmail?: boolean; // 🆕 فیلد جدید اضافه شده
}

// مدل پاسخ ارسال اطلاعیه (ادمین)
export interface SendNotificationResponse {
  message: string;
  notification?: Notification;
  count: number;
}

// تایپ پاسخ صفحه‌بندی شده اطلاعیه‌ها
export type PaginatedNotifications = PaginatedResponse<Notification>;
