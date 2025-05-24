// src/api/services/analytics-service.ts - آپدیت شده
import axios from "@/lib/axios";
import {
  TimeRange,
  UsageAnalytics,
  AnalyticsRequest,
  DownloadAnalyticsRequest,
} from "@/api/types/analytics.types";

export const analyticsService = {
  /**
   * دریافت آنالیتیکس استفاده کاربر جاری - آپدیت شده
   * @param params پارامترهای درخواست (timeRange, productId, productUid)
   */
  getUserAnalytics: async (
    params?: AnalyticsRequest
  ): Promise<UsageAnalytics> => {
    const response = await axios.get("/usage/analytics", {
      params,
    });
    return response.data;
  },

  /**
   * آنالیتیکس کل محصولات - helper method
   * @param timeRange بازه زمانی
   */
  getAllProductsAnalytics: async (
    timeRange?: TimeRange
  ): Promise<UsageAnalytics> => {
    const response = await axios.get("/usage/analytics", {
      params: { timeRange },
    });
    return response.data;
  },

  /**
   * آنالیتیکس یک محصول خاص با productId - helper method
   * @param productId شناسه محصول
   * @param timeRange بازه زمانی
   */
  getProductAnalyticsById: async (
    productId: string,
    timeRange?: TimeRange
  ): Promise<UsageAnalytics> => {
    const response = await axios.get("/usage/analytics", {
      params: { productId, timeRange },
    });
    return response.data;
  },

  /**
   * آنالیتیکس یک محصول خاص با productUid - helper method
   * @param productUid شناسه منحصر به فرد محصول
   * @param timeRange بازه زمانی
   */
  getProductAnalyticsByUid: async (
    productUid: string,
    timeRange?: TimeRange
  ): Promise<UsageAnalytics> => {
    const response = await axios.get("/usage/analytics", {
      params: { productUid, timeRange },
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس استفاده کاربر جاری - آپدیت شده
   * @param params پارامترهای دانلود (productId, productUid)
   */
  downloadUserAnalytics: async (
    params?: DownloadAnalyticsRequest
  ): Promise<Blob> => {
    const response = await axios.get("/usage/analytics/download", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس کل محصولات - helper method
   */
  downloadAllProductsAnalytics: async (): Promise<Blob> => {
    const response = await axios.get("/usage/analytics/download", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس یک محصول خاص - helper method
   * @param productId شناسه محصول
   */
  downloadProductAnalytics: async (productId: string): Promise<Blob> => {
    const response = await axios.get("/usage/analytics/download", {
      params: { productId },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * دریافت آنالیتیکس استفاده کاربر (ادمین) - آپدیت شده
   * @param userId شناسه کاربر
   * @param params پارامترهای درخواست
   */
  getUserAnalyticsByAdmin: async (
    userId: string,
    params?: AnalyticsRequest
  ): Promise<UsageAnalytics> => {
    const response = await axios.get(`/usage/users/${userId}/analytics`, {
      params,
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس استفاده کاربر (ادمین) - آپدیت شده
   * @param userId شناسه کاربر
   * @param params پارامترهای دانلود
   */
  downloadUserAnalyticsByAdmin: async (
    userId: string,
    params?: DownloadAnalyticsRequest
  ): Promise<Blob> => {
    const response = await axios.get(
      `/usage/users/${userId}/analytics/download`,
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  },
};
