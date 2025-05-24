"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { RevenueStatsResponse } from "@/api/types/revenue-stats.types";

// Dynamic import برای ApexCharts (برای SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PlatformRevenueChartProps {
  data: RevenueStatsResponse | null;
  isLoading: boolean;
}

export function PlatformRevenueChart({
  data,
  isLoading,
}: PlatformRevenueChartProps) {
  const { t, locale } = useLanguage();

  const chartData = useMemo(() => {
    if (!data) return null;

    const platforms = [
      { key: "normal", label: t("admin.analytics.revenue.platforms.normal") },
      { key: "divar", label: t("admin.analytics.revenue.platforms.divar") },
      { key: "torob", label: t("admin.analytics.revenue.platforms.torob") },
      { key: "basalam", label: t("admin.analytics.revenue.platforms.basalam") },
    ];

    // 🔧 اصلاح: جدا کردن سری‌های درآمد و سفارش
    const revenueSeries = platforms.map(
      (platform) =>
        data[platform.key as keyof RevenueStatsResponse]?.totalRevenue || 0
    );

    const ordersSeries = platforms.map(
      (platform) =>
        data[platform.key as keyof RevenueStatsResponse]?.totalOrders || 0
    );

    const platformLabels = platforms.map((p) => p.label);

    return {
      revenueSeries,
      ordersSeries,
      platformLabels,
    };
  }, [data, t]);

  const options = useMemo(
    () => ({
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
        // 🔧 اصلاح: تنظیمات تم برای tooltip
        theme: {
          mode: "light" as const,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 4,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: chartData?.platformLabels || [],
        labels: {
          style: {
            fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
            colors: "#6B7280",
            fontSize: "12px",
          },
        },
      },
      yaxis: [
        {
          title: {
            text: t("admin.analytics.revenue.totalRevenue"),
            style: {
              fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
              color: "#6B7280",
            },
          },
          labels: {
            formatter: (value: number) => {
              return value > 1000000
                ? `${(value / 1000000).toFixed(1)}M`
                : value > 1000
                ? `${(value / 1000).toFixed(1)}K`
                : value.toString();
            },
            style: {
              fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
              colors: "#6B7280",
            },
          },
        },
        {
          opposite: true,
          title: {
            text: t("admin.analytics.revenue.totalOrders"),
            style: {
              fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
              color: "#6B7280",
            },
          },
          labels: {
            formatter: (value: number) => value.toString(),
            style: {
              fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
              colors: "#6B7280",
            },
          },
        },
      ],
      fill: {
        opacity: 1,
      },
      // 🔧 اصلاح کامل tooltip
      tooltip: {
        theme: "light",
        style: {
          fontSize: "12px",
          fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
        },
        // 🎨 تنظیمات رنگ و استایل
        fillSeriesColor: false,
        marker: {
          show: true,
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          const platformName = chartData?.platformLabels[dataPointIndex] || "";
          const isRevenue = seriesIndex === 0;
          const value = series[seriesIndex][dataPointIndex];

          const formattedValue = isRevenue
            ? formatCurrency(value)
            : value.toLocaleString();

          const title = isRevenue
            ? t("admin.analytics.revenue.totalRevenue")
            : t("admin.analytics.revenue.totalOrders");

          return `
          <div style="
            background: white; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 12px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            font-family: ${locale === "fa" ? "IranSans" : "Montserrat"};
            min-width: 150px;
          ">
            <div style="
              font-weight: 600; 
              color: #374151; 
              margin-bottom: 4px;
              font-size: 13px;
            ">
              ${platformName}
            </div>
            <div style="
              color: ${isRevenue ? "#3B82F6" : "#10B981"}; 
              font-weight: 500;
              font-size: 12px;
            ">
              ${title}: ${formattedValue}
            </div>
          </div>
        `;
        },
      },
      legend: {
        position: "bottom" as const,
        labels: {
          useSeriesColors: true,
          colors: "#374151",
        },
        fontFamily: locale === "fa" ? "IranSans" : "Montserrat",
        fontSize: "12px",
      },
      colors: ["#3B82F6", "#10B981"],
      // 🔧 اضافه: grid styling
      grid: {
        borderColor: "#F3F4F6",
        strokeDashArray: 3,
      },
    }),
    [chartData, t, locale]
  );

  // 🔧 اصلاح: series data
  const series = useMemo(
    () => [
      {
        name: t("admin.analytics.revenue.totalRevenue"),
        data: chartData?.revenueSeries || [],
        yAxisIndex: 0,
      },
      {
        name: t("admin.analytics.revenue.totalOrders"),
        data: chartData?.ordersSeries || [],
        yAxisIndex: 1,
      },
    ],
    [chartData, t]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("admin.analytics.charts.platformComparison")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("admin.analytics.charts.platformComparison")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {t("admin.analytics.charts.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.analytics.charts.platformComparison")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={350} />
      </CardContent>
    </Card>
  );
}
