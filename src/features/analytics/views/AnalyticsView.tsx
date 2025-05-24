// src/features/analytics/views/AnalyticsView.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAnalytics } from "@/api/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { UsageStatsCard } from "../components/UsageStatsCard";
import { UsageChartCard } from "../components/UsageChartCard";
import { BrowserStatsCard } from "../components/BrowserStatsCard";
import { SuccessRateCard } from "../components/SuccessRateCard";
import { TimeRange } from "@/api/types/analytics.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Activity,
  RefreshCcw,
  Download,
  Globe,
  Monitor,
  Smartphone,
  BarChart,
} from "lucide-react";

// تعریف رابط ChartSeries برای رفع مشکل تایپ
interface ChartSeries {
  name: string;
  data: number[];
}

export function AnalyticsView() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const { getUserAnalytics, downloadAnalytics, isDownloadingAnalytics } =
    useUserAnalytics();

  // **مهم: تغییر اینجا - پارامتر رو به صورت object پاس می‌کنیم**
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = getUserAnalytics({ timeRange }); // اینجا تغییر کردیم

  // Function to process time distribution data for chart
  const processTimeDistributionData = () => {
    if (!analytics)
      return { series: [] as ChartSeries[], categories: [] as string[] };

    const byDate = analytics.timeDistribution.byDate;
    const categories = Object.keys(byDate);

    // تبدیل مستقیم به آرایه‌ای از اعداد
    const values = Object.values(byDate).map((value) => Number(value));

    const series: ChartSeries[] = [
      {
        name: t("analytics.requests"),
        data: values,
      },
    ];

    return { series, categories };
  };

  const { series, categories } = processTimeDistributionData();

  // Handle download analytics
  const handleDownload = async () => {
    try {
      await downloadAnalytics({});
    } catch (error) {
      console.error("Error downloading analytics:", error);
    }
  };

  // Handle refresh analytics
  const handleRefresh = () => {
    refetch();
  };

  // کمک تابع برای یافتن بیشترین مقدار در یک رکورد
  const getTopItem = (stats: Record<string, number>): string => {
    if (!stats || Object.keys(stats).length === 0) return "-";

    let maxItem = "";
    let maxValue = 0;

    for (const [key, value] of Object.entries(stats)) {
      if (value > maxValue) {
        maxValue = value;
        maxItem = key;
      }
    }

    return maxItem;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("analytics.title")}
          </h1>
          <p className="text-muted-foreground">{t("analytics.description")}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloadingAnalytics || isLoading}
          >
            {isDownloadingAnalytics ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t("analytics.download")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching || isLoading}
          >
            {isRefetching ? (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("analytics.error.title")}</AlertTitle>
          <AlertDescription>
            {t("analytics.error.fetchFailed")}
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" text="common.loading" />
        </div>
      ) : analytics ? (
        <>
          {/* Usage Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <UsageStatsCard
              title={t("analytics.totalRequests")}
              value={analytics.totalRequests}
              maxValue={10000} // Placeholder - replace with actual limit
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              format="number"
            />
            <SuccessRateCard
              title={t("analytics.requestsSuccessRate")}
              successRate={analytics.successRate}
            />
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>{t("analytics.topStats")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Top Device */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("analytics.topDevice")}</span>
                  </div>
                  <span className="font-medium text-sm">
                    {getTopItem(analytics.deviceStats)}
                  </span>
                </div>

                {/* Top Browser */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("analytics.topBrowser")}</span>
                  </div>
                  <span className="font-medium text-sm">
                    {getTopItem(analytics.browserStats)}
                  </span>
                </div>

                {/* Top OS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("analytics.topOS")}</span>
                  </div>
                  <span className="font-medium text-sm">
                    {getTopItem(analytics.osStats)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Chart */}
          <div className="mt-6">
            <UsageChartCard
              title={t("analytics.usageOverTime")}
              series={series}
              categories={categories}
              timeRange={timeRange}
              onTimeRangeChange={(value) => setTimeRange(value as TimeRange)}
              type="area"
              colors={["#3B82F6"]}
            />
          </div>

          {/* Stats by Browser, Device, OS */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <BrowserStatsCard
              title={t("analytics.browserDistribution")}
              data={analytics.browserStats}
            />
            <BrowserStatsCard
              title={t("analytics.deviceDistribution")}
              data={analytics.deviceStats}
            />
            <BrowserStatsCard
              title={t("analytics.osDistribution")}
              data={analytics.osStats}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
