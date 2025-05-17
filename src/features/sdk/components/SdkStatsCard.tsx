// src/features/sdk/components/SdkStatsCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SdkStatus } from "@/api/types/sdk.types";
import { formatDate, getDaysRemaining } from "@/lib";

interface SdkStatsCardProps {
  status: SdkStatus;
}

export function SdkStatsCard({ status }: SdkStatsCardProps) {
  const { t, isRtl } = useLanguage();

  const usagePercent =
    status.requestLimit.monthly > 0
      ? Math.round(
          ((status.requestLimit.monthly - status.requestLimit.remaining) /
            status.requestLimit.monthly) *
            100
        )
      : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("sdk.usageStatistics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* محدودیت درخواست */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {t("sdk.requestLimit")}
              </span>
              <span className="text-sm">
                {status.requestLimit.remaining} / {status.requestLimit.monthly}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t("sdk.remainingRequests", {
                count: status.requestLimit.remaining,
              })}
            </p>
          </div>

          {/* تاریخ انقضا */}
          <div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">{t("sdk.expiryDate")}</span>
              <span className="text-sm">
                {formatDate(status.endDate, isRtl ? "fa-IR" : "en-US")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("sdk.daysRemaining", {
                count: getDaysRemaining(status.endDate),
              })}
            </p>
          </div>

          {/* آمار استفاده */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              {t("sdk.usageBreakdown")}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t("sdk.totalUsage")}</span>
                <span className="text-sm">{status.usageStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t("sdk.validateCalls")}</span>
                <span className="text-sm">{status.usageStats.validate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t("sdk.applyCalls")}</span>
                <span className="text-sm">{status.usageStats.apply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t("sdk.checkCalls")}</span>
                <span className="text-sm">{status.usageStats.check}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t("sdk.otherCalls")}</span>
                <span className="text-sm">{status.usageStats.other}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
