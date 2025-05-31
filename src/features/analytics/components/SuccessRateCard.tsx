// src/features/analytics/components/SuccessRateCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";
import { parseSuccessRate, formatSuccessRate } from "@/lib/analytics-utils";
import {
  safeSuccessRate,
  safeNumberFormat,
  createEmptyState,
} from "@/lib/safe-data-utils";

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

  // ✅ Safe handling of successRate data using utility
  const { success, failed, rate, total, hasData } =
    safeSuccessRate(successRate);

  const successPercent = parseSuccessRate(rate);
  const failedPercent = 100 - successPercent;
  const emptyState = createEmptyState(
    "داده‌ای موجود نیست",
    "هنوز درخواستی ثبت نشده است"
  );

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
        ) : !hasData ? (
          <div className="h-[120px] flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-lg font-medium mb-2">{emptyState.title}</div>
              <div className="text-sm">{emptyState.description}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>{t("analytics.success")}</span>
              </div>
              <span className="font-medium">
                {safeNumberFormat(success, isRtl ? "fa-IR" : "en-US")} (
                {formatSuccessRate(rate)})
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                <span>{t("analytics.failed")}</span>
              </div>
              <span className="font-medium">
                {safeNumberFormat(failed, isRtl ? "fa-IR" : "en-US")} (
                {failedPercent.toFixed(1)}%)
              </span>
            </div>

            <div className="relative pt-4">
              <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="flex flex-col justify-center overflow-hidden bg-green-500 text-xs text-white text-center"
                  style={{ width: formatSuccessRate(rate) }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <div>
                  {t("analytics.totalRequests")}:{" "}
                  {safeNumberFormat(total, isRtl ? "fa-IR" : "en-US")}
                </div>
                <div>
                  {t("analytics.successRate")}: {formatSuccessRate(rate)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
