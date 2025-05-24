// src/features/products/components/ProductAnalyticsPreview.tsx
"use client";

import { useUserAnalytics } from "@/api/hooks/useAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/api/types/products.types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertCircle,
  Zap,
} from "lucide-react";

interface ProductAnalyticsPreviewProps {
  product: Product;
  className?: string;
}

export function ProductAnalyticsPreview({
  product,
  className,
}: ProductAnalyticsPreviewProps) {
  const { t, isRtl } = useLanguage();

  const { getProductAnalyticsById } = useUserAnalytics();

  // دریافت آنالیتیکس محدود برای پیش‌نمایش (فقط هفته گذشته)
  const {
    data: analytics,
    isLoading,
    error,
  } = getProductAnalyticsById(product._id, "week");

  if (isLoading) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-3 border ${className}`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border ${className}`}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{t("analytics.noUsageData")}</span>
        </div>
      </div>
    );
  }

  // محاسبه نرخ موفقیت به عنوان عدد
  const successRateNum = parseFloat(
    analytics.successRate.rate.replace("%", "")
  );
  const isGoodPerformance = successRateNum >= 95;
  const isOkPerformance = successRateNum >= 80;

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800 ${className}`}
    >
      {/* هدر */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
            {t("analytics.thisWeek")}
          </span>
        </div>

        <Badge
          variant={
            isGoodPerformance
              ? "default"
              : isOkPerformance
              ? "secondary"
              : "destructive"
          }
          className="text-xs px-2 py-0.5"
        >
          {isGoodPerformance && <TrendingUp className="h-3 w-3 mr-1" />}
          {!isGoodPerformance && !isOkPerformance && (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {analytics.successRate.rate}
        </Badge>
      </div>

      {/* آمار اصلی */}
      <div className="grid grid-cols-2 gap-3">
        {/* تعداد درخواست‌ها */}
        <div className="bg-white/60 dark:bg-gray-800/30 rounded-md p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity className="h-3 w-3 text-green-600" />
            <span className="text-xs text-muted-foreground">
              {t("analytics.requests")}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {analytics.totalRequests.toLocaleString(isRtl ? "fa-IR" : "en-US")}
          </div>
        </div>

        {/* درخواست‌های موفق */}
        <div className="bg-white/60 dark:bg-gray-800/30 rounded-md p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-purple-600" />
            <span className="text-xs text-muted-foreground">
              {t("analytics.successful")}
            </span>
          </div>
          <div className="text-lg font-bold text-green-600">
            {analytics.successRate.success.toLocaleString(
              isRtl ? "fa-IR" : "en-US"
            )}
          </div>
        </div>
      </div>

      {/* نوار پیشرفت کوچک */}
      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            isGoodPerformance
              ? "bg-green-500"
              : isOkPerformance
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(successRateNum, 100)}%` }}
        />
      </div>
    </div>
  );
}
