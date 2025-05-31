// src/features/analytics/components/BrowserStatsCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  safeObjectData,
  safePercentages,
  createEmptyState,
} from "@/lib/safe-data-utils";
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

  // ✅ Safe handling of data using utility
  const { labels, values, hasData } = safeObjectData(data);
  const percentages = safePercentages(values);
  const emptyState = createEmptyState();

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

  // Chart colors
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
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
        colors: isDarkTheme ? "#E2E8F0" : "#334155",
        useSeriesColors: false,
      },
      fontSize: "14px",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
      },
      style: {
        colors: ["#ffffff"],
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
              color: isDarkTheme ? "#F1F5F9" : "#1E293B",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: isDarkTheme ? "#F1F5F9" : "#1E293B",
              formatter: function (val: any) {
                return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
              },
            },
            total: {
              show: true,
              showAlways: false,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: isDarkTheme ? "#CBD5E1" : "#475569",
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
      colors: isDarkTheme ? ["#1E293B"] : ["#ffffff"],
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
        ) : !hasData ? (
          <div className="h-[250px] flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div className="text-lg font-medium mb-2">{emptyState.title}</div>
              <div className="text-sm">{emptyState.description}</div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <ReactApexChart
              options={options as any}
              series={percentages}
              type="donut"
              height={height}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
