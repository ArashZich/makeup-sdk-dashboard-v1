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
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
    "#F97316", // orange
    "#84CC16", // lime
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
        colors: isDarkTheme ? "#f8fafc" : "#0f172a",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        // اطمینان از اینکه val یک عدد است
        return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
      },
      style: {
        colors: ["#fff"],
      },
    },
    tooltip: {
      theme: isDarkTheme ? "dark" : "light",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: function (val: any) {
                // اطمینان از اینکه val یک عدد است
                return typeof val === "number" ? val.toFixed(1) + "%" : "0%";
              },
            },
            total: {
              show: true,
              showAlways: false,
              formatter: function (w: any) {
                return (
                  w.globals.seriesTotals
                    .reduce((a: number, b: number) => a + b, 0)
                    .toFixed(1) + "%"
                );
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
          },
        },
      },
    ],
    theme: {
      mode: isDarkTheme ? "dark" : "light",
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
