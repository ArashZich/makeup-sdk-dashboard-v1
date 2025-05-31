// src/features/analytics/components/SuccessRateCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";
import { parseSuccessRate, formatSuccessRate } from "@/lib/analytics-utils";

interface SuccessRateCardProps {
  title: string;
  successRate: {
    success: number;
    failed: number;
    rate: string;
  };
  isLoading?: boolean;
}

export function SuccessRateCard({
  title,
  successRate,
  isLoading = false,
}: SuccessRateCardProps) {
  const { t, isRtl } = useLanguage();

  // استفاده از متد کمکی برای parse کردن نرخ موفقیت
  const successPercent = parseSuccessRate(successRate.rate);
  const totalRequests = successRate.success + successRate.failed;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>{t("analytics.success")}</span>
              </div>
              <span className="font-medium">
                {successRate.success.toLocaleString(isRtl ? "fa-IR" : "en-US")}{" "}
                ({formatSuccessRate(successRate.rate)})
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                <span>{t("analytics.failed")}</span>
              </div>
              <span className="font-medium">
                {successRate.failed.toLocaleString(isRtl ? "fa-IR" : "en-US")} (
                {(100 - successPercent).toFixed(1)}%)
              </span>
            </div>

            <div className="relative pt-4">
              <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="flex flex-col justify-center overflow-hidden bg-green-500 text-xs text-white text-center"
                  style={{ width: formatSuccessRate(successRate.rate) }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <div>
                  {t("analytics.totalRequests")}:{" "}
                  {totalRequests.toLocaleString(isRtl ? "fa-IR" : "en-US")}
                </div>
                <div>
                  {t("analytics.successRate")}:{" "}
                  {formatSuccessRate(successRate.rate)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
