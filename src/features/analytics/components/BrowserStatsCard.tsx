// src/features/analytics/components/BrowserStatsCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Dynamically import the chart to avoid server-side rendering issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface BrowserStatsCardProps {
  title: string;
  data: Record<string, number>;
  isLoading?: boolean;
  height?: number;
}

export function BrowserStatsCard({
  title,
  data,
  isLoading = false,
  height = 250,
}: BrowserStatsCardProps) {
  const { isRtl } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to access theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const labels = Object.keys(data);
  const values = Object.values(data);

  // Calculate percentages
  const total = values.reduce((sum, value) => sum + value, 0);
  const percentages = values.map((value) =>
    total > 0 ? (value / total) * 100 : 0
  );

  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const isDarkTheme = theme === "dark";

  // بهبود رنگ‌های نمودار برای تمام تم‌ها
  const colors = [
    "#3B82F6", // blue - آبی روشن
    "#10B981", // emerald - سبز زمردی
    "#F59E0B", // amber - نارنجی طلایی
    "#EF4444", // red - قرمز
    "#8B5CF6", // violet - بنفش
    "#EC4899", // pink - صورتی
    "#06B6D4", // cyan - فیروزه‌ای
    "#84CC16", // lime - سبز لیمویی
    "#F97316", // orange - نارنجی
    "#6366F1", // indigo - نیلی
  ];

  // Chart options
  const options = {
    chart: {
      fontFamily: isRtl
        ? "IRANSans, Tahoma, sans-serif"
        : "Montserrat, Arial, sans-serif",
      background: "transparent",
    },
    labels,
    colors,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        // استفاده از رنگ‌های بهتر برای contrast
        colors: isDarkTheme ? "#E2E8F0" : "#334155", // slate-200 برای dark و slate-700 برای light
        useSeriesColors: false, // از رنگ‌های سری استفاده نکن
      },
      fontSize: "14px",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        // اطمینان از اینکه val یک عدد است
        return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
      },
      style: {
        colors: ["#ffffff"], // همیشه سفید برای روی رنگ‌های تیره
        fontSize: "12px",
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
    },
    tooltip: {
      theme: isDarkTheme ? "dark" : "light",
      style: {
        fontSize: "14px",
      },
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + "%";
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 600,
              color: isDarkTheme ? "#F1F5F9" : "#1E293B", // slate-100 برای dark و slate-800 برای light
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: isDarkTheme ? "#F1F5F9" : "#1E293B", // slate-100 برای dark و slate-800 برای light
              formatter: function (val: any) {
                // اطمینان از اینکه val یک عدد است
                return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
              },
            },
            total: {
              show: true,
              showAlways: false,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: isDarkTheme ? "#CBD5E1" : "#475569", // slate-300 برای dark و slate-600 برای light
              formatter: function (w: any) {
                return "100%";
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
            fontSize: "12px",
          },
          dataLabels: {
            style: {
              fontSize: "10px",
            },
          },
        },
      },
    ],
    theme: {
      mode: isDarkTheme ? "dark" : "light",
    },
    stroke: {
      show: true,
      width: 2,
      colors: isDarkTheme ? ["#1E293B"] : ["#ffffff"], // border بین قسمت‌ها
    },
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <div className="w-full">
            <ReactApexChart
              options={options as any}
              series={percentages} // استفاده از درصدها
              type="donut"
              height={height}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
