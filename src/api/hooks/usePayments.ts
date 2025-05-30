// src/api/hooks/usePayments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/api/services/payments-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  PaymentFilters,
  CreatePaymentRequest,
  PaymentStatus,
  PaymentsTimeRange,
  PaymentsPlatform,
  PaymentsAllPlatformsStatsResponse,
} from "@/api/types/payments.types";

/**
 * هوک برای استفاده از API پرداخت‌ها برای کاربر عادی
 */
export const useUserPayments = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ایجاد درخواست پرداخت
  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      paymentsService.createPayment(data),
    onSuccess: (data) => {
      // در اینجا کاربر را به صفحه پرداخت هدایت می‌کنیم
      if (typeof window !== "undefined" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // دریافت پرداخت‌های کاربر جاری با فیلتر وضعیت (اختیاری)
  const getUserPayments = (status?: PaymentStatus) => {
    return useQuery({
      queryKey: ["userPayments", status],
      queryFn: () => paymentsService.getCurrentUserPayments(status),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت پرداخت با شناسه
  const getPayment = (paymentId: string) => {
    return useQuery({
      queryKey: ["payment", paymentId],
      queryFn: () => paymentsService.getPaymentById(paymentId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // لغو پرداخت
  const cancelPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsService.cancelPayment(paymentId),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["payment", data.payment._id], data.payment);
      // باطل کردن کش پرداخت‌ها
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      showToast.success(
        t("payments.cancelPayment") + ": " + t("common.success.update")
      );
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  return {
    createPayment: createPaymentMutation.mutateAsync,
    getUserPayments,
    getPayment,
    cancelPayment: cancelPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    isCancelingPayment: cancelPaymentMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API پرداخت‌ها برای ادمین
 */
export const useAdminPayments = () => {
  // دریافت همه پرداخت‌ها با فیلتر
  const getAllPayments = (filters?: PaymentFilters) => {
    return useQuery({
      queryKey: ["payments", filters],
      queryFn: () => paymentsService.getAllPayments(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  return {
    getAllPayments,
  };
};

/**
 * هوک برای استفاده از API آمار درآمد پرداخت‌ها
 */
export const usePaymentsStats = () => {
  /**
   * دریافت آمار کلی همه پلتفرم‌ها
   * @param timeRange بازه زمانی
   */
  const useAllPlatformsStats = (timeRange?: PaymentsTimeRange) => {
    return useQuery({
      queryKey: ["paymentsStats", "all", timeRange],
      queryFn: () => paymentsService.getAllPlatformsStats({ timeRange }),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: true,
    });
  };

  /**
   * دریافت آمار پلتفرم خاص
   * @param platform نوع پلتفرم
   * @param timeRange بازه زمانی
   */
  const usePlatformStats = (
    platform: PaymentsPlatform,
    timeRange?: PaymentsTimeRange
  ) => {
    return useQuery({
      queryKey: ["paymentsStats", platform, timeRange],
      queryFn: () => paymentsService.getPlatformStats({ platform, timeRange }),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: !!platform,
    });
  };

  /**
   * دریافت آمار پلتفرم عادی
   * @param timeRange بازه زمانی
   */
  const useNormalPlatformStats = (timeRange?: PaymentsTimeRange) => {
    return useQuery({
      queryKey: ["paymentsStats", "normal", timeRange],
      queryFn: () => paymentsService.getNormalPlatformStats(timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم دیوار
   * @param timeRange بازه زمانی
   */
  const useDivarPlatformStats = (timeRange?: PaymentsTimeRange) => {
    return useQuery({
      queryKey: ["paymentsStats", "divar", timeRange],
      queryFn: () => paymentsService.getDivarPlatformStats(timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم ترب
   * @param timeRange بازه زمانی
   */
  const useTorobPlatformStats = (timeRange?: PaymentsTimeRange) => {
    return useQuery({
      queryKey: ["paymentsStats", "torob", timeRange],
      queryFn: () => paymentsService.getTorobPlatformStats(timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  /**
   * دریافت آمار پلتفرم باسلام
   * @param timeRange بازه زمانی
   */
  const useBasalamPlatformStats = (timeRange?: PaymentsTimeRange) => {
    return useQuery({
      queryKey: ["paymentsStats", "basalam", timeRange],
      queryFn: () => paymentsService.getBasalamPlatformStats(timeRange),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // Helper functions برای تحلیل داده‌ها

  /**
   * محاسبه رشد درآمد بین دو دوره
   * @param currentRevenue درآمد فعلی
   * @param previousRevenue درآمد دوره قبل
   */
  const calculateRevenueGrowth = (
    currentRevenue: number,
    previousRevenue: number
  ) => {
    if (previousRevenue === 0) return 0;
    return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  };

  /**
   * پیدا کردن پرفروش‌ترین پلتفرم
   * @param stats آمار همه پلتفرم‌ها
   */
  const getTopPerformingPlatform = (
    stats: PaymentsAllPlatformsStatsResponse
  ): { platform: PaymentsPlatform; revenue: number } => {
    const platforms: { platform: PaymentsPlatform; revenue: number }[] = [
      { platform: "normal", revenue: stats.platforms.normal.totalRevenue },
      { platform: "divar", revenue: stats.platforms.divar.totalRevenue },
      { platform: "torob", revenue: stats.platforms.torob?.totalRevenue || 0 },
      {
        platform: "basalam",
        revenue: stats.platforms.basalam?.totalRevenue || 0,
      },
    ];

    return platforms.reduce((top, current) =>
      current.revenue > top.revenue ? current : top
    );
  };

  /**
   * محاسبه سهم هر پلتفرم از کل درآمد
   * @param stats آمار همه پلتفرم‌ها
   */
  const calculatePlatformShare = (stats: PaymentsAllPlatformsStatsResponse) => {
    const total = stats.summary.totalRevenue;
    if (total === 0) return {};

    return {
      normal: (stats.platforms.normal.totalRevenue / total) * 100,
      divar: (stats.platforms.divar.totalRevenue / total) * 100,
      torob: ((stats.platforms.torob?.totalRevenue || 0) / total) * 100,
      basalam: ((stats.platforms.basalam?.totalRevenue || 0) / total) * 100,
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

    // Helper functions
    calculateRevenueGrowth,
    getTopPerformingPlatform,
    calculatePlatformShare,
  };
};

/**
 * هوک ساده‌تر برای استفاده سریع از آمار
 * @param platform پلتفرم (اختیاری)
 * @param timeRange بازه زمانی (اختیاری)
 */
export const useSimplePaymentsStats = (
  platform?: PaymentsPlatform,
  timeRange?: PaymentsTimeRange
) => {
  const { useAllPlatformsStats, usePlatformStats } = usePaymentsStats();

  if (platform) {
    return usePlatformStats(platform, timeRange);
  }

  return useAllPlatformsStats(timeRange);
};
