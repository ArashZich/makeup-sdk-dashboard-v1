// src/features/products/components/ProductAnalytics.tsx
"use client";

import { useState } from "react";
import { useUserAnalytics } from "@/api/hooks/useAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/api/types/products.types";
import { TimeRange } from "@/api/types/analytics.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import { UsageChartCard } from "@/features/analytics/components/UsageChartCard";
import { BrowserStatsCard } from "@/features/analytics/components/BrowserStatsCard";
import { SuccessRateCard } from "@/features/analytics/components/SuccessRateCard";
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Smartphone,
  Globe,
  AlertCircle,
  Activity,
} from "lucide-react";

interface ProductAnalyticsProps {
  product: Product;
  className?: string;
}

export function ProductAnalytics({
  product,
  className,
}: ProductAnalyticsProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  const {
    getProductAnalyticsById,
    downloadProductAnalytics,
    isDownloadingAnalytics,
  } = useUserAnalytics();

  // دریافت آنالیتیکس محصول
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = getProductAnalyticsById(product._id, timeRange);

  // دانلود آنالیتیکس
  const handleDownload = async () => {
    try {
      await downloadProductAnalytics(product._id);
    } catch (error) {
      console.error("Error downloading analytics:", error);
    }
  };

  // رفرش آنالیتیکس
  const handleRefresh = () => {
    refetch();
  };

  // پردازش داده‌ها برای نمودار
  const processTimeDistributionData = () => {
    if (!analytics) return { series: [], categories: [] };

    const byDate = analytics.timeDistribution.byDate;
    const categories = Object.keys(byDate);
    const values = Object.values(byDate).map((value) => Number(value));

    const series = [
      {
        name: t("analytics.requests"),
        data: values,
      },
    ];

    return { series, categories };
  };

  const { series, categories } = processTimeDistributionData();

  // یافتن بیشترین مقدار در یک رکورد
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
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("analytics.productAnalytics")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("analytics.productAnalyticsDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("common.refresh")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("analytics.error.fetchFailed")}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="analytics.loading" />
          </div>
        ) : analytics ? (
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="week">
                {t("analytics.timeRange.week")}
              </TabsTrigger>
              <TabsTrigger value="month">
                {t("analytics.timeRange.month")}
              </TabsTrigger>
              <TabsTrigger value="halfyear">
                {t("analytics.timeRange.halfyear")}
              </TabsTrigger>
              <TabsTrigger value="year">
                {t("analytics.timeRange.year")}
              </TabsTrigger>
              <TabsTrigger value="all">
                {t("analytics.timeRange.all")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={timeRange} className="space-y-6">
              {/* آمار خلاصه */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      {t("analytics.totalRequests")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalRequests}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {t("analytics.successRate")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.successRate.rate}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      {t("analytics.topBrowser")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">
                      {getTopItem(analytics.browserStats)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-orange-500" />
                      {t("analytics.topDevice")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">
                      {getTopItem(analytics.deviceStats)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* نمودار استفاده در طول زمان */}
              {series.length > 0 && categories.length > 0 && (
                <UsageChartCard
                  title={t("analytics.usageOverTime")}
                  series={series}
                  categories={categories}
                  type="area"
                  colors={["#3B82F6"]}
                />
              )}

              {/* آمار تفصیلی */}
              <div className="grid gap-4 md:grid-cols-3">
                <SuccessRateCard
                  title={t("analytics.requestsSuccessRate")}
                  successRate={analytics.successRate}
                />
                <BrowserStatsCard
                  title={t("analytics.browserDistribution")}
                  data={analytics.browserStats}
                />
                <BrowserStatsCard
                  title={t("analytics.deviceDistribution")}
                  data={analytics.deviceStats}
                />
              </div>

              {/* اطلاعات محصول */}
              {analytics.productInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {t("analytics.productInfo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("products.productId")}:
                      </span>
                      <Badge variant="outline">
                        {analytics.productInfo.productUid}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {t("products.name")}:
                      </span>
                      <span className="text-sm font-medium">
                        {analytics.productInfo.productName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t("analytics.noData")}
            </h3>
            <p className="text-muted-foreground">
              {t("analytics.noDataDescription")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
