// src/api/hooks/useRevenueStats.ts
import { useQuery } from "@tanstack/react-query";
import { revenueStatsService } from "@/api/services/revenue-stats-service";
import {
  RevenueStatsRequest,
  RevenueStatsResponse,
  FilteredRevenueStatsResponse,
  RevenuePlatform,
  PlatformRevenueStats,
} from "@/api/types/revenue-stats.types";

/**
 * هوک برای استفاده از API آمار درآمد (فقط ادمین)
 */
export const useRevenueStats = () => {
  /**
   * دریافت آمار درآمد با فیلترهای دلخواه
   * @param filters فیلترهای درخواست
   */
  const getRevenueStats = (filters?: RevenueStatsRequest) => {
    return useQuery({
      queryKey: ["revenueStats", filters],
      queryFn: () => revenueStatsService.getRevenueStats(filters),
      staleTime: 10 * 60 * 1000, // 10 دقیقه (آمار درآمد کمتر تغییر می‌کنه)
      enabled: true, // فقط اگر کاربر ادمین باشه باید true بشه
    });
  };

  /**
   * دریافت آمار کل پلتفرم‌ها
   * @param startDate تاریخ شروع
   * @param endDate تاریخ پایان
   */
  const getAllPlatformsStats = (startDate?: string, endDate?: string) => {
    return useQuery<RevenueStatsResponse>({
      queryKey: ["revenueStats", "all", startDate, endDate],
      queryFn: () =>
        revenueStatsService.getAllPlatformsRevenueStats(startDate, endDate),
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * دریافت آمار یک پلتفرم خاص
   * @param platform پلتفرم مورد نظر
   * @param startDate تاریخ شروع
   * @param endDate تاریخ پایان
   */
  const getPlatformStats = (
    platform: RevenuePlatform,
    startDate?: string,
    endDate?: string
  ) => {
    return useQuery<FilteredRevenueStatsResponse>({
      queryKey: ["revenueStats", platform, startDate, endDate],
      queryFn: () =>
        revenueStatsService.getPlatformRevenueStats(
          platform,
          startDate,
          endDate
        ),
      staleTime: 10 * 60 * 1000,
      enabled: Boolean(platform), // فقط اگر پلتفرم مشخص باشه
    });
  };

  // Helper functions برای کار با آمار درآمد

  /**
   * محاسبه درصد درآمد هر پلتفرم نسبت به کل
   * @param stats آمار کل پلتفرم‌ها
   */
  const calculatePlatformPercentages = (stats: RevenueStatsResponse) => {
    const total = stats.total.totalRevenue;
    if (total === 0) return {};

    const percentages: Record<string, number> = {};

    percentages.normal = (stats.normal.totalRevenue / total) * 100;
    percentages.divar = (stats.divar.totalRevenue / total) * 100;

    if (stats.torob) {
      percentages.torob = (stats.torob.totalRevenue / total) * 100;
    }

    if (stats.basalam) {
      percentages.basalam = (stats.basalam.totalRevenue / total) * 100;
    }

    return percentages;
  };

  /**
   * یافتن پربازده‌ترین پلتفرم
   * @param stats آمار کل پلتفرم‌ها
   */
  const getTopPerformingPlatform = (stats: RevenueStatsResponse) => {
    const platforms = [
      { name: "normal", stats: stats.normal },
      { name: "divar", stats: stats.divar },
      ...(stats.torob ? [{ name: "torob", stats: stats.torob }] : []),
      ...(stats.basalam ? [{ name: "basalam", stats: stats.basalam }] : []),
    ];

    return platforms.reduce((top, current) =>
      current.stats.totalRevenue > top.stats.totalRevenue ? current : top
    );
  };

  /**
   * محاسبه رشد درآمد بین دو دوره
   * @param currentStats آمار دوره فعلی
   * @param previousStats آمار دوره قبلی
   */
  const calculateGrowthRate = (
    currentStats: PlatformRevenueStats | RevenueStatsResponse,
    previousStats: PlatformRevenueStats | RevenueStatsResponse
  ) => {
    const currentRevenue =
      "total" in currentStats
        ? currentStats.total.totalRevenue
        : currentStats.totalRevenue;

    const previousRevenue =
      "total" in previousStats
        ? previousStats.total.totalRevenue
        : previousStats.totalRevenue;

    if (previousRevenue === 0) return 0;

    return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  };

  /**
   * فرمت کردن مبلغ به ریال
   * @param amount مبلغ
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    // Query functions
    getRevenueStats,
    getAllPlatformsStats,
    getPlatformStats,

    // Helper functions
    calculatePlatformPercentages,
    getTopPerformingPlatform,
    calculateGrowthRate,
    formatCurrency,
  };
};
