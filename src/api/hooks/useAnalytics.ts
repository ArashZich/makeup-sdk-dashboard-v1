// src/api/hooks/useAnalytics.ts - آپدیت شده
import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/api/services/analytics-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TimeRange,
  AnalyticsRequest,
  DownloadAnalyticsRequest,
} from "@/api/types/analytics.types";

/**
 * هوک برای استفاده از API آنالیتیکس برای کاربر عادی - آپدیت شده
 */
export const useUserAnalytics = () => {
  const { t } = useLanguage();

  // دریافت آنالیتیکس استفاده کاربر جاری - آپدیت شده
  const getUserAnalytics = (params?: AnalyticsRequest) => {
    return useQuery({
      queryKey: ["userAnalytics", params],
      queryFn: () => analyticsService.getUserAnalytics(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // آنالیتیکس کل محصولات - helper function
  const getAllProductsAnalytics = (timeRange?: TimeRange) => {
    return useQuery({
      queryKey: ["userAnalytics", "all", timeRange],
      queryFn: () => analyticsService.getAllProductsAnalytics(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // آنالیتیکس یک محصول خاص با productId - helper function
  const getProductAnalyticsById = (
    productId: string,
    timeRange?: TimeRange
  ) => {
    return useQuery({
      queryKey: ["userAnalytics", "product", productId, timeRange],
      queryFn: () =>
        analyticsService.getProductAnalyticsById(productId, timeRange),
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(productId), // فقط اگر productId وجود داشته باشد
    });
  };

  // آنالیتیکس یک محصول خاص با productUid - helper function
  const getProductAnalyticsByUid = (
    productUid: string,
    timeRange?: TimeRange
  ) => {
    return useQuery({
      queryKey: ["userAnalytics", "productUid", productUid, timeRange],
      queryFn: () =>
        analyticsService.getProductAnalyticsByUid(productUid, timeRange),
      staleTime: 5 * 60 * 1000,
      enabled: Boolean(productUid), // فقط اگر productUid وجود داشته باشد
    });
  };

  // دانلود آنالیتیکس استفاده کاربر جاری - آپدیت شده
  const downloadAnalyticsMutation = useMutation({
    mutationFn: (params?: DownloadAnalyticsRequest) =>
      analyticsService.downloadUserAnalytics(params),
    onSuccess: (data, params) => {
      // تعیین نام فایل بر اساس نوع دانلود
      const getFileName = () => {
        const date = new Date().toISOString().slice(0, 10);
        if (params?.productId) {
          return `analytics-product-${params.productId}_${date}.json`;
        }
        if (params?.productUid) {
          return `analytics-product-${params.productUid}_${date}.json`;
        }
        return `analytics_${date}.json`;
      };

      // ایجاد یک URL موقت برای دانلود فایل
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      showToast.success(t("analytics.downloadSuccess"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("analytics.downloadError")
      );
    },
  });

  // Helper functions برای دانلود انواع مختلف
  const downloadAllProductsAnalytics = () => {
    return downloadAnalyticsMutation.mutateAsync(undefined);
  };

  const downloadProductAnalytics = (productId: string) => {
    return downloadAnalyticsMutation.mutateAsync({ productId });
  };

  const downloadProductAnalyticsByUid = (productUid: string) => {
    return downloadAnalyticsMutation.mutateAsync({ productUid });
  };

  return {
    // Query functions
    getUserAnalytics,
    getAllProductsAnalytics,
    getProductAnalyticsById,
    getProductAnalyticsByUid,

    // Download functions
    downloadAnalytics: downloadAnalyticsMutation.mutateAsync,
    downloadAllProductsAnalytics,
    downloadProductAnalytics,
    downloadProductAnalyticsByUid,

    // States
    isDownloadingAnalytics: downloadAnalyticsMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API آنالیتیکس برای ادمین - آپدیت شده
 */
export const useAdminAnalytics = () => {
  const { t } = useLanguage();

  // دریافت آنالیتیکس استفاده کاربر - آپدیت شده
  const getUserAnalytics = (userId: string, params?: AnalyticsRequest) => {
    return useQuery({
      queryKey: ["adminUserAnalytics", userId, params],
      queryFn: () => analyticsService.getUserAnalyticsByAdmin(userId, params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دانلود آنالیتیکس استفاده کاربر - آپدیت شده
  const downloadUserAnalyticsMutation = useMutation({
    mutationFn: ({
      userId,
      params,
    }: {
      userId: string;
      params?: DownloadAnalyticsRequest;
    }) => analyticsService.downloadUserAnalyticsByAdmin(userId, params),
    onSuccess: (data, { userId, params }) => {
      // تعیین نام فایل
      const getFileName = () => {
        const date = new Date().toISOString().slice(0, 10);
        if (params?.productId) {
          return `user_analytics_${userId}_product_${params.productId}_${date}.json`;
        }
        if (params?.productUid) {
          return `user_analytics_${userId}_product_${params.productUid}_${date}.json`;
        }
        return `user_analytics_${userId}_${date}.json`;
      };

      // ایجاد یک URL موقت برای دانلود فایل
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName();
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      showToast.success(t("analytics.downloadSuccess"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("analytics.downloadError")
      );
    },
  });

  return {
    getUserAnalytics,
    downloadUserAnalytics: downloadUserAnalyticsMutation.mutateAsync,
    isDownloadingUserAnalytics: downloadUserAnalyticsMutation.isPending,
  };
};
