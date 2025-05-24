// src/features/products/components/ProductAnalytics.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  AlertCircle,
} from "lucide-react";

// Dynamic import برای ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ProductAnalyticsProps {
  product: Product;
  className?: string;
}

export function ProductAnalytics({
  product,
  className,
}: ProductAnalyticsProps) {
  const { t, isRtl } = useLanguage();
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

  // محاسبه نرخ موفقیت به عنوان عدد
  const getSuccessRateNumber = (): number => {
    if (!analytics) return 0;
    return parseFloat(analytics.successRate.rate.replace("%", ""));
  };

  // تنظیمات نمودار خطی/منطقه‌ای برای استفاده روزانه
  const getUsageChartData = () => {
    if (!analytics?.timeDistribution.byDate) {
      return { series: [], options: {} };
    }

    const data = analytics.timeDistribution.byDate;
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

    const categories = entries.map(([date]) => {
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      return isRtl ? `${day}/${month}` : `${month}/${day}`;
    });

    const values = entries.map(([, value]) => Number(value));

    const series = [
      {
        name: t("analytics.requests"),
        data: values,
      },
    ];

    const options = {
      chart: {
        type: "area" as const,
        height: 350,
        fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      colors: ["#3B82F6"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth" as const,
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: categories,
        title: {
          text: t("analytics.date"),
          style: {
            fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
          },
        },
        labels: {
          style: {
            fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
          },
        },
      },
      yaxis: {
        title: {
          text: t("analytics.requests"),
          style: {
            fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
          },
        },
        labels: {
          style: {
            fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
          },
          formatter: (value: number) => Math.round(value).toString(),
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark", // تغییر از light به dark
        style: {
          fontSize: "14px",
          fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
          color: "#ffffff", // رنگ متن سفید
        },
        fillSeriesColor: false,
        backgroundColor: "#1f2937", // پس‌زمینه تیره
        borderColor: "#374151",
        borderWidth: 1,
        borderRadius: 8,
        y: {
          formatter: (value: number) => `${value} ${t("analytics.requests")}`,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
          },
        },
      ],
    };

    return { series, options };
  };

  // تنظیمات نمودار دایره‌ای برای مرورگرها
  const getBrowserChartData = () => {
    if (!analytics?.browserStats) return { series: [], options: {} };

    const data = Object.entries(analytics.browserStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6); // فقط 6 مورد اول

    const series = data.map(([, value]) => value);
    const labels = data.map(([browser]) => browser);

    const options = {
      chart: {
        type: "donut" as const,
        fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
      },
      labels: labels,
      colors: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
      ],
      legend: {
        position: "bottom" as const,
        fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
        fontSize: "14px",
      },
      tooltip: {
        style: {
          fontFamily: isRtl ? "IRANSansX, sans-serif" : "Inter, sans-serif",
        },
        y: {
          formatter: (value: number) => `${value} ${t("analytics.requests")}`,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
            labels: {
              show: true,
              total: {
                show: true,
                label: t("analytics.total"),
                formatter: () => series.reduce((a, b) => a + b, 0).toString(),
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    return { series, options };
  };

  const { series: usageSeries, options: usageOptions } = getUsageChartData();
  const { series: browserSeries, options: browserOptions } =
    getBrowserChartData();

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
            <Loader size="lg" text={t("analytics.loading")} />
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* کل درخواست‌ها */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      {t("analytics.totalRequests")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalRequests.toLocaleString(
                        isRtl ? "fa-IR" : "en-US"
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* نرخ موفقیت */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getSuccessRateNumber() >= 95 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-yellow-500" />
                      )}
                      {t("analytics.successRate")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        getSuccessRateNumber() >= 95
                          ? "text-green-600"
                          : getSuccessRateNumber() >= 80
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.successRate.rate}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analytics.successRate.success}{" "}
                      {t("analytics.successful")} /{" "}
                      {analytics.successRate.success +
                        analytics.successRate.failed}
                    </p>
                  </CardContent>
                </Card>

                {/* بالاترین مرورگر */}
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

                {/* بالاترین دستگاه */}
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

              {/* نمودار ApexCharts استفاده روزانه */}
              {usageSeries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("analytics.usageOverTime")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Chart
                      options={usageOptions}
                      series={usageSeries}
                      type="area"
                      height={350}
                    />
                  </CardContent>
                </Card>
              )}

              {/* نمودارهای تفصیلی */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* آمار موفقیت/شکست */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("analytics.requestsBreakdown")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {t("analytics.successful")}
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {analytics.successRate.success}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            {t("analytics.failed")}
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {analytics.successRate.failed}
                        </div>
                      </div>
                    </div>

                    {/* نوار پیشرفت */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getSuccessRateNumber()}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* نمودار دایره‌ای مرورگرها */}
                {browserSeries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {t("analytics.browserDistribution")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Chart
                        options={browserOptions}
                        series={browserSeries}
                        type="donut"
                        height={300}
                      />
                    </CardContent>
                  </Card>
                )}
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
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t("analytics.noData")}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("analytics.noDataDescription")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
