// src/api/services/analytics-service.ts
import axios from "@/lib/axios";
import { TimeRange, UsageAnalytics } from "@/api/types/analytics.types";

export const analyticsService = {
  /**
   * دریافت آنالیتیکس استفاده کاربر جاری
   * @param timeRange بازه زمانی
   */
  getUserAnalytics: async (timeRange?: TimeRange): Promise<UsageAnalytics> => {
    const response = await axios.get("/usage/analytics", {
      params: { timeRange },
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس استفاده کاربر جاری
   */
  downloadUserAnalytics: async (): Promise<Blob> => {
    const response = await axios.get("/usage/analytics/download", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * دریافت آنالیتیکس استفاده کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param timeRange بازه زمانی
   */
  getUserAnalyticsByAdmin: async (
    userId: string,
    timeRange?: TimeRange
  ): Promise<UsageAnalytics> => {
    const response = await axios.get(`/usage/users/${userId}/analytics`, {
      params: { timeRange },
    });
    return response.data;
  },

  /**
   * دانلود آنالیتیکس استفاده کاربر (ادمین)
   * @param userId شناسه کاربر
   */
  downloadUserAnalyticsByAdmin: async (userId: string): Promise<Blob> => {
    const response = await axios.get(
      `/usage/users/${userId}/analytics/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
