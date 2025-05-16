// src/api/hooks/useNotifications.ts - اصلاح شده
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/api/services/notifications-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUIStore } from "@/store/ui.store";
import { useEffect } from "react";
import {
  NotificationFilters,
  SendNotificationRequest,
  PaginatedNotifications,
} from "@/api/types/notifications.types";

/**
 * هوک برای استفاده از API اطلاع‌رسانی‌ها برای کاربر عادی
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { setUnreadNotifications } = useUIStore();

  // دریافت اطلاعیه‌های کاربر جاری
  const getUserNotifications = (filters?: NotificationFilters) => {
    const result = useQuery({
      queryKey: ["userNotifications", filters],
      queryFn: () => notificationsService.getCurrentUserNotifications(filters),
      staleTime: 2 * 60 * 1000, // 2 دقیقه
      refetchInterval: 5 * 60 * 1000, // هر 5 دقیقه به‌روزرسانی
    });

    // بررسی تعداد اطلاعیه‌های خوانده نشده با useEffect
    useEffect(() => {
      if (result.data && filters?.read === false) {
        setUnreadNotifications(result.data.totalResults);
      }
    }, [result.data, filters]);

    return result;
  };

  // علامت‌گذاری اطلاعیه به عنوان خوانده شده
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsRead(notificationId),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["notification", data._id], data);
      // باطل کردن کش اطلاعیه‌ها
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });

      // دریافت داده‌های کش فعلی اطلاعیه‌های خوانده نشده
      const unreadData = queryClient.getQueryData<PaginatedNotifications>([
        "userNotifications",
        { read: false },
      ]);
      if (unreadData && unreadData.totalResults > 0) {
        setUnreadNotifications(unreadData.totalResults - 1);
      }
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // علامت‌گذاری همه اطلاعیه‌ها به عنوان خوانده شده
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      // باطل کردن کش اطلاعیه‌ها
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      // تنظیم تعداد اطلاعیه‌های خوانده نشده به صفر
      setUnreadNotifications(0);
      showToast.success(
        t("notifications.markAllAsRead") + ": " + t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  /**
   * هوک برای دریافت تعداد اطلاعیه‌های خوانده نشده
   */
  const useUnreadNotificationsCount = () => {
    const { data } = useQuery({
      queryKey: ["userNotifications", { read: false }],
      queryFn: () =>
        notificationsService.getCurrentUserNotifications({ read: false }),
      staleTime: 2 * 60 * 1000, // 2 دقیقه
      refetchInterval: 5 * 60 * 1000, // هر 5 دقیقه به‌روزرسانی
    });

    // بررسی تعداد اطلاعیه‌های خوانده نشده با useEffect
    useEffect(() => {
      if (data) {
        setUnreadNotifications(data.totalResults);
      }
    }, [data]);

    return {
      count: data?.totalResults || 0,
      hasUnread: (data?.totalResults || 0) > 0,
    };
  };

  return {
    getUserNotifications,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    useUnreadNotificationsCount,
  };
};

/**
 * هوک برای استفاده از API اطلاع‌رسانی‌ها برای ادمین
 */
export const useAdminNotifications = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت همه اطلاعیه‌ها
  const getAllNotifications = (
    filters?: NotificationFilters & { userId?: string; planId?: string }
  ) => {
    return useQuery({
      queryKey: ["adminNotifications", filters],
      queryFn: () => notificationsService.getAllNotifications(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ارسال اطلاعیه
  const sendNotificationMutation = useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      notificationsService.sendNotification(data),
    onSuccess: (data) => {
      // باطل کردن کش اطلاعیه‌ها
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });

      // اگر به یک کاربر خاص ارسال شده است، باطل کردن کش اطلاعیه‌های آن کاربر
      if (data.notification?.userId) {
        const userId =
          typeof data.notification.userId === "string"
            ? data.notification.userId
            : (data.notification.userId as any)._id;

        queryClient.invalidateQueries({
          queryKey: ["userNotifications", { userId }],
        });
      }

      showToast.success(
        t("notifications.admin.sendNotification") +
          ": " +
          t("common.success.create")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getAllNotifications,
    sendNotification: sendNotificationMutation.mutateAsync,
    isSendingNotification: sendNotificationMutation.isPending,
  };
};
