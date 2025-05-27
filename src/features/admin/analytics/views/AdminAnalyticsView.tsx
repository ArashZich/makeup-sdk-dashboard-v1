"use client";

import { useState } from "react";
import { usePaymentsStats } from "@/api/hooks/usePayments";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { PaymentsTimeRange } from "@/api/types/payments.types";
import { RevenueStatsCards } from "../components/RevenueStatsCards";
import { PlatformRevenueChart } from "../components/PlatformRevenueChart";
import { RevenueTimeRangeSelector } from "../components/RevenueTimeRangeSelector";
import { RevenueExportButton } from "../components/RevenueExportButton";

export function AdminAnalyticsView() {
  const { t } = useLanguage();
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<PaymentsTimeRange>("month");

  // استفاده از hook آمار درآمد
  const { useAllPlatformsStats } = usePaymentsStats();

  const {
    data: revenueData,
    isLoading,
    error,
    refetch,
  } = useAllPlatformsStats(selectedTimeRange);

  const handleTimeRangeChange = (range: PaymentsTimeRange) => {
    setSelectedTimeRange(range);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                {t("common.error.general")}
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                {t("common.refresh")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.analytics.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.analytics.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RevenueExportButton
            data={revenueData || null}
            timeRange={selectedTimeRange}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Separator />

      {/* Time Range Selector */}
      <RevenueTimeRangeSelector
        selectedRange={selectedTimeRange}
        onRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Revenue Stats Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {t("admin.analytics.revenue.title")}
        </h2>
        <RevenueStatsCards
          data={revenueData || null}
          isLoading={isLoading}
          timeRange={selectedTimeRange}
        />
      </div>

      {/* Platform Revenue Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {t("admin.analytics.charts.platformComparison")}
        </h2>
        <PlatformRevenueChart
          data={revenueData || null}
          isLoading={isLoading}
        />
      </div>

      {/* Revenue Summary */}
      {revenueData && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  {t("admin.analytics.revenue.platforms.normal")}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {revenueData.summary.totalRevenue > 0
                    ? (
                        (revenueData.platforms.normal.totalRevenue /
                          revenueData.summary.totalRevenue) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  {t("admin.analytics.revenue.platforms.divar")}
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {revenueData.summary.totalRevenue > 0
                    ? (
                        (revenueData.platforms.divar.totalRevenue /
                          revenueData.summary.totalRevenue) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-muted-foreground">
                  {t("admin.analytics.revenue.totalRevenue")}
                </h3>
                <p className="text-2xl font-bold">
                  {revenueData.summary.totalRevenue.toLocaleString()}{" "}
                  {t("common.currency.toman")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
