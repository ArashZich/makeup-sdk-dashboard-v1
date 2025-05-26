// src/api/services/revenue-stats-service.ts - آپدیت شده
import axios from "@/lib/axios";
import {
  RevenueStatsRequest,
  RevenueStatsResponse,
  FilteredRevenueStatsResponse,
} from "@/api/types/revenue-stats.types";

export const revenueStatsService = {
  /**
   * دریافت آمار درآمد کلی همه پلتفرم‌ها
   * @param params پارامترهای فیلتر (تاریخ)
   */
  getAllPlatformsStats: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<RevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", { params });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم خاص
   * @param params پارامترهای فیلتر (شامل پلتفرم و تاریخ)
   */
  getPlatformStats: async (
    params: RevenueStatsRequest
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", { params });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم عادی
   * @param params پارامترهای فیلتر تاریخ
   */
  getNormalPlatformStats: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", {
      params: { ...params, platform: "normal" },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم دیوار
   * @param params پارامترهای فیلتر تاریخ
   */
  getDivarPlatformStats: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", {
      params: { ...params, platform: "divar" },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم ترب
   * @param params پارامترهای فیلتر تاریخ
   */
  getTorobPlatformStats: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", {
      params: { ...params, platform: "torob" },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم باسلام
   * @param params پارامترهای فیلتر تاریخ
   */
  getBasalamPlatformStats: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats", {
      params: { ...params, platform: "basalam" },
    });
    return response.data;
  },

  /**
   * مقایسه آمار درآمد بین پلتفرم‌ها در بازه زمانی مشخص
   * @param params پارامترهای فیلتر تاریخ
   */
  comparePlatformsRevenue: async (
    params?: Omit<RevenueStatsRequest, "platform">
  ): Promise<RevenueStatsResponse> => {
    const response = await axios.get("/revenue-stats/compare", { params });
    return response.data;
  },

  /**
   * دریافت گزارش کامل آمار درآمد برای export
   * @param params پارامترهای فیلتر
   */
  exportRevenueReport: async (params?: RevenueStatsRequest): Promise<Blob> => {
    const response = await axios.get("/revenue-stats/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
