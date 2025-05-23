// src/api/services/revenue-stats-service.ts
import axios from "@/lib/axios";
import {
  RevenueStatsRequest,
  RevenueStatsResponse,
  FilteredRevenueStatsResponse,
} from "@/api/types/revenue-stats.types";

export const revenueStatsService = {
  /**
   * دریافت آمار درآمد بر اساس پلتفرم (فقط ادمین)
   *
   * @param filters پارامترهای فیلتر (پلتفرم، تاریخ شروع، تاریخ پایان)
   * @returns اگر platform مشخص باشد، آمار آن پلتفرم را برمی‌گرداند
   *          اگر platform مشخص نباشد، آمار تمام پلتفرم‌ها را برمی‌گرداند
   */
  getRevenueStats: async (
    filters?: RevenueStatsRequest
  ): Promise<RevenueStatsResponse | FilteredRevenueStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: filters,
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد تمام پلتفرم‌ها (بدون فیلتر)
   * @param startDate تاریخ شروع (اختیاری)
   * @param endDate تاریخ پایان (اختیاری)
   */
  getAllPlatformsRevenueStats: async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد یک پلتفرم خاص
   * @param platform پلتفرم مورد نظر
   * @param startDate تاریخ شروع (اختیاری)
   * @param endDate تاریخ پایان (اختیاری)
   */
  getPlatformRevenueStats: async (
    platform: string,
    startDate?: string,
    endDate?: string
  ): Promise<FilteredRevenueStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { platform, startDate, endDate },
    });
    return response.data;
  },
};
