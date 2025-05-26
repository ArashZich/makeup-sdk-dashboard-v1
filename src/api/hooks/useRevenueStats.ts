// src/api/hooks/useRevenueStats.ts - آپدیت شده
import { useQuery, useMutation } from "@tanstack/react-query";
import { revenueStatsService } from "@/api/services/revenue-stats-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  RevenueStatsRequest,
  RevenueStatsResponse,
  FilteredRevenueStatsResponse,
  RevenuePlatform,
} from "@/api/types/revenue-stats.types";

/**
 * هوک برای استفاده از API آمار درآمد
 */
export const useRevenueStats = () => {
  const { t } = useLanguage();

  /**
   * دریافت آمار کلی همه پلتفرم‌ها
   * @param params پارامترهای فیلتر تاریخ
   */
  const useAllPlatformsStats = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "all", params],
      queryFn: () => revenueStatsService.getAllPlatformsStats(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: true,
    });
  };

  /**
   * دریافت آمار پلتفرم خاص
   * @param platform نوع پلتفرم
   * @param params پارامترهای فیلتر تاریخ
   */
  const usePlatformStats = (
    platform: RevenuePlatform,
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", platform, params],
      queryFn: () =>
        revenueStatsService.getPlatformStats({ ...params, platform }),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: !!platform,
    });
  };

  /**
   * دریافت آمار پلتفرم عادی
   * @param params پارامترهای فیلتر تاریخ
   */
  const useNormalPlatformStats = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "normal", params],
      queryFn: () => revenueStatsService.getNormalPlatformStats(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم دیوار
   * @param params پارامترهای فیلتر تاریخ
   */
  const useDivarPlatformStats = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "divar", params],
      queryFn: () => revenueStatsService.getDivarPlatformStats(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم ترب
   * @param params پارامترهای فیلتر تاریخ
   */
  const useTorobPlatformStats = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "torob", params],
      queryFn: () => revenueStatsService.getTorobPlatformStats(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم باسلام
   * @param params پارامترهای فیلتر تاریخ
   */
  const useBasalamPlatformStats = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "basalam", params],
      queryFn: () => revenueStatsService.getBasalamPlatformStats(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * مقایسه آمار بین پلتفرم‌ها
   * @param params پارامترهای فیلتر تاریخ
   */
  const useComparePlatformsRevenue = (
    params?: Omit<RevenueStatsRequest, "platform">
  ) => {
    return useQuery({
      queryKey: ["revenueStats", "compare", params],
      queryFn: () => revenueStatsService.comparePlatformsRevenue(params),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * Export گزارش آمار درآمد
   */
  const exportRevenueReportMutation = useMutation({
    mutationFn: (params?: RevenueStatsRequest) =>
      revenueStatsService.exportRevenueReport(params),
    onSuccess: (blob, variables) => {
      // ایجاد لینک دانلود
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // تعیین نام فایل بر اساس پلتفرم و تاریخ
      const platform = variables?.platform || "all";
      const date = new Date().toISOString().split("T")[0];
      link.download = `revenue-report-${platform}-${date}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast.success(t("common.success.export"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.export")
      );
    },
  });

  // Helper functions برای تحلیل داده‌ها

  /**
   * محاسبه رشد درآمد بین دو دوره
   * @param currentStats آمار دوره جاری
   * @param previousStats آمار دوره قبل
   */
  const calculateRevenueGrowth = (
    currentStats: FilteredRevenueStatsResponse,
    previousStats: FilteredRevenueStatsResponse
  ) => {
    if (previousStats.totalRevenue === 0) return 0;

    return (
      ((currentStats.totalRevenue - previousStats.totalRevenue) /
        previousStats.totalRevenue) *
      100
    );
  };

  /**
   * پیدا کردن پرفروش‌ترین پلتفرم
   * @param stats آمار همه پلتفرم‌ها
   */
  const getTopPerformingPlatform = (
    stats: RevenueStatsResponse
  ): { platform: RevenuePlatform; revenue: number } => {
    const platforms: { platform: RevenuePlatform; revenue: number }[] = [
      { platform: "normal", revenue: stats.normal.totalRevenue },
      { platform: "divar", revenue: stats.divar.totalRevenue },
      { platform: "torob", revenue: stats.torob?.totalRevenue || 0 },
      { platform: "basalam", revenue: stats.basalam?.totalRevenue || 0 },
    ];

    return platforms.reduce((top, current) =>
      current.revenue > top.revenue ? current : top
    );
  };

  /**
   * محاسبه سهم هر پلتفرم از کل درآمد
   * @param stats آمار همه پلتفرم‌ها
   */
  const calculatePlatformShare = (stats: RevenueStatsResponse) => {
    const total = stats.total.totalRevenue;
    if (total === 0) return {};

    return {
      normal: (stats.normal.totalRevenue / total) * 100,
      divar: (stats.divar.totalRevenue / total) * 100,
      torob: ((stats.torob?.totalRevenue || 0) / total) * 100,
      basalam: ((stats.basalam?.totalRevenue || 0) / total) * 100,
    };
  };

  return {
    // Query hooks
    useAllPlatformsStats,
    usePlatformStats,
    useNormalPlatformStats,
    useDivarPlatformStats,
    useTorobPlatformStats,
    useBasalamPlatformStats,
    useComparePlatformsRevenue,

    // Mutation hooks
    exportRevenueReport: exportRevenueReportMutation.mutateAsync,
    isExportingReport: exportRevenueReportMutation.isPending,

    // Helper functions
    calculateRevenueGrowth,
    getTopPerformingPlatform,
    calculatePlatformShare,
  };
};

/**
 * هوک ساده‌تر برای استفاده سریع
 * @param platform پلتفرم (اختیاری)
 * @param dateRange بازه زمانی (اختیاری)
 */
export const useSimpleRevenueStats = (
  platform?: RevenuePlatform,
  dateRange?: { startDate?: string; endDate?: string }
) => {
  const { useAllPlatformsStats, usePlatformStats } = useRevenueStats();

  if (platform) {
    return usePlatformStats(platform, dateRange);
  }

  return useAllPlatformsStats(dateRange);
};
