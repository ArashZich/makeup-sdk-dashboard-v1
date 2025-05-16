// src/api/hooks/useAnalytics.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/api/services/analytics-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimeRange } from "@/api/types/analytics.types";

/**
 * هوک برای استفاده از API آنالیتیکس برای کاربر عادی
 */
export const useUserAnalytics = () => {
  const { t } = useLanguage();

  // دریافت آنالیتیکس استفاده کاربر جاری
  const getUserAnalytics = (timeRange?: TimeRange) => {
    return useQuery({
      queryKey: ["userAnalytics", timeRange],
      queryFn: () => analyticsService.getUserAnalytics(timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دانلود آنالیتیکس استفاده کاربر جاری
  const downloadAnalyticsMutation = useMutation({
    mutationFn: analyticsService.downloadUserAnalytics,
    onSuccess: (data) => {
      // ایجاد یک URL موقت برای دانلود فایل
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getUserAnalytics,
    downloadAnalytics: downloadAnalyticsMutation.mutateAsync,
    isDownloadingAnalytics: downloadAnalyticsMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API آنالیتیکس برای ادمین
 */
export const useAdminAnalytics = () => {
  const { t } = useLanguage();

  // دریافت آنالیتیکس استفاده کاربر
  const getUserAnalytics = (userId: string, timeRange?: TimeRange) => {
    return useQuery({
      queryKey: ["adminUserAnalytics", userId, timeRange],
      queryFn: () =>
        analyticsService.getUserAnalyticsByAdmin(userId, timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دانلود آنالیتیکس استفاده کاربر
  const downloadUserAnalyticsMutation = useMutation({
    mutationFn: (userId: string) =>
      analyticsService.downloadUserAnalyticsByAdmin(userId),
    onSuccess: (data, userId) => {
      // ایجاد یک URL موقت برای دانلود فایل
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_analytics_${userId}_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getUserAnalytics,
    downloadUserAnalytics: downloadUserAnalyticsMutation.mutateAsync,
    isDownloadingUserAnalytics: downloadUserAnalyticsMutation.isPending,
  };
};
