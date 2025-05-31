// src/features/analytics/components/UsageChartCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { canDisplayChart, createEmptyState } from "@/lib/safe-data-utils";
import { toJalali } from "@/lib/date";
import dynamic from "next/dynamic";

// Dynamically import the chart to avoid server-side rendering issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Export interface so it can be imported where needed
export interface ChartSeries {
  name: string;
  data: number[];
}

interface UsageChartCardProps {
  title: string;
  series: ChartSeries[];
  categories: string[];
  isLoading?: boolean;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  height?: number;
  type?: "line" | "bar" | "area";
  colors?: string[];
}

export function UsageChartCard({
  title,
  series,
  categories,
  isLoading = false,
  timeRange = "week",
  onTimeRangeChange,
  height = 350,
  type = "line",
  colors,
}: UsageChartCardProps) {
  const { t, isRtl } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to access theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Safe handling of chart data using utility
  const hasChartData = canDisplayChart(series.flatMap((s) => s.data));
  const emptyState = createEmptyState(
    "داده‌ای موجود نیست",
    "هنوز آماری برای نمایش در نمودار وجود ندارد"
  );

  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // ✅ Safe processing of categories for date formatting
  const formattedCategories = categories.map((date) => {
    try {
      // بررسی آیا مقدار یک تاریخ معتبر است
      if (isRtl) {
        // برای فارسی به شمسی تبدیل می‌کنیم
        return toJalali(new Date(date));
      } else {
        // برای انگلیسی تاریخ میلادی به فرمت مناسب
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch (e) {
      // اگر تبدیل با خطا مواجه شد، مقدار اصلی را برمی‌گردانیم
      return date;
    }
  });

  const isDarkTheme = theme === "dark";

  // Chart options
  const options = {
    chart: {
      type,
      fontFamily: isRtl
        ? "IRANSans, Tahoma, sans-serif"
        : "Montserrat, Arial, sans-serif",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
      animations: {
        enabled: true,
      },
      background: "transparent", // پس‌زمینه شفاف
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: colors || ["#66DA26", "#546E7A", "#E91E63", "#FF9800"],
    xaxis: {
      categories: formattedCategories, // استفاده از تاریخ‌های فرمت‌شده
      labels: {
        style: {
          colors: isDarkTheme ? "#CBD5E1" : "#64748b",
        },
        rotate: -45,
        formatter: function (value: string) {
          // نمایش فرمت کوتاه‌تر در محور X
          if (value && value.length > 15) {
            return value.substring(0, 15) + "...";
          }
          return value;
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDarkTheme ? "#CBD5E1" : "#64748b",
        },
      },
    },
    tooltip: {
      theme: isDarkTheme ? "dark" : "light",
      x: {
        formatter: function (
          value: number,
          { series, seriesIndex, dataPointIndex, w }: any
        ) {
          // نمایش تاریخ کامل در tooltip
          return categories[dataPointIndex] || "";
        },
      },
      style: {
        fontSize: "12px",
        fontFamily: isRtl
          ? "IRANSans, Tahoma, sans-serif"
          : "Montserrat, Arial, sans-serif",
      },
      // اضافه کردن استایل‌های سفارشی برای tooltip
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const value = series[seriesIndex][dataPointIndex];
        const category = categories[dataPointIndex] || "";
        const seriesName = w.globals.seriesNames[seriesIndex] || "";

        // استایل مناسب برای tooltip
        const bgColor = isDarkTheme ? "#1f2937" : "#ffffff";
        const textColor = isDarkTheme ? "#f3f4f6" : "#1f2937";
        const borderColor = isDarkTheme ? "#374151" : "#e5e7eb";

        return `
          <div class="arrow_box" style="
            background: ${bgColor}; 
            color: ${textColor}; 
            border: 1px solid ${borderColor};
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            font-family: ${
              isRtl
                ? "IRANSans, Tahoma, sans-serif"
                : "Montserrat, Arial, sans-serif"
            };
            direction: ${isRtl ? "rtl" : "ltr"};
          ">
            <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid ${borderColor}; padding-bottom: 3px;">
              ${category}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${seriesName}:</span>
              <span style="font-weight: bold;">${(value || 0).toLocaleString(
                isRtl ? "fa-IR" : "en-US"
              )}</span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      borderColor: isDarkTheme ? "#334155" : "#e2e8f0",
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: isDarkTheme ? "#f8fafc" : "#0f172a",
      },
    },
    theme: {
      mode: isDarkTheme ? "dark" : "light",
    },
  };

  const timeRangeOptions = [
    { value: "week", label: t("analytics.timeRange.week") },
    { value: "month", label: t("analytics.timeRange.month") },
    { value: "halfyear", label: t("analytics.timeRange.halfyear") },
    { value: "year", label: t("analytics.timeRange.year") },
    { value: "all", label: t("analytics.timeRange.all") },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {onTimeRangeChange && (
          <Tabs defaultValue={timeRange} onValueChange={onTimeRangeChange}>
            <TabsList>
              {timeRangeOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : !hasChartData ? (
          <div className="h-[350px] flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-lg font-medium mb-2">{emptyState.title}</div>
              <div className="text-sm">{emptyState.description}</div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <ReactApexChart
              options={options as any}
              series={series}
              type={type}
              height={height}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
