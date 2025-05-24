// src/features/sdk/components/SdkStatsCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { SdkStatus } from "@/api/types/sdk.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Activity,
  Infinity,
} from "lucide-react";
import { formatDate } from "@/lib/date";

interface SdkStatsCardProps {
  status: SdkStatus;
  className?: string;
}

export function SdkStatsCard({ status, className }: SdkStatsCardProps) {
  const { t, isRtl } = useLanguage();

  // محاسبه درصد استفاده
  const usagePercentage =
    status.requestLimit.monthly === -1
      ? 0 // برای نامحدود، progress bar نمایش نمی‌دهیم
      : Math.round(
          ((status.requestLimit.monthly - status.requestLimit.remaining) /
            status.requestLimit.monthly) *
            100
        );

  const isUnlimited = status.requestLimit.monthly === -1;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t("sdk.stats.title")}
        </CardTitle>
        <CardDescription>{t("sdk.stats.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* وضعیت بسته */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("sdk.stats.status")}</span>
          <Badge variant={status.status === "active" ? "default" : "secondary"}>
            {t(`sdk.status.${status.status}`)}
          </Badge>
        </div>

        {/* تاریخ انقضا */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t("sdk.stats.expiryDate")}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDate(status.endDate, isRtl ? "fa-IR" : "en-US")}
          </span>
        </div>

        {/* محدودیت درخواست */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Activity className="h-4 w-4" />
              {t("sdk.stats.requestLimit")}
            </span>
            <div className="text-left">
              <div className="text-sm font-medium">
                {isUnlimited ? (
                  <span className="flex items-center gap-1">
                    <Infinity className="h-4 w-4" />
                    {t("common.unlimited")}
                  </span>
                ) : (
                  `${status.requestLimit.remaining} / ${status.requestLimit.monthly}`
                )}
              </div>
              {!isUnlimited && (
                <div className="text-xs text-muted-foreground">
                  {t("sdk.stats.monthlyLimit")}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar فقط برای محدود */}
          {!isUnlimited && <Progress value={usagePercentage} className="h-2" />}
        </div>

        {/* آمار استفاده */}
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{t("sdk.stats.usage")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">
                {t("sdk.stats.totalRequests")}
              </div>
              <div className="font-medium">{status.usageStats.total}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t("sdk.stats.validateRequests")}
              </div>
              <div className="font-medium">{status.usageStats.validate}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t("sdk.stats.applyRequests")}
              </div>
              <div className="font-medium">{status.usageStats.apply}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {t("sdk.stats.otherRequests")}
              </div>
              <div className="font-medium">{status.usageStats.other}</div>
            </div>
          </div>
        </div>

        {/* نوع پروژه */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t("sdk.stats.projectType")}
          </span>
          <Badge variant="outline">{status.projectType}</Badge>
        </div>

        {/* پرمیوم */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("sdk.stats.premium")}</span>
          <Badge variant={status.isPremium ? "default" : "secondary"}>
            {status.isPremium ? t("common.yes") : t("common.no")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
