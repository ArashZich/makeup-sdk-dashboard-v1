"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingCart, TrendingUp, Calculator } from "lucide-react";
import {
  PaymentsAllPlatformsStatsResponse,
  PaymentsTimeRange,
} from "@/api/types/payments.types";

interface RevenueStatsCardsProps {
  data: PaymentsAllPlatformsStatsResponse | null;
  isLoading: boolean;
  timeRange?: PaymentsTimeRange;
}

export function RevenueStatsCards({
  data,
  isLoading,
  timeRange = "month",
}: RevenueStatsCardsProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {t("admin.analytics.charts.noData")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: t("admin.analytics.revenue.totalRevenue"),
      value: formatCurrency(data.summary.totalRevenue),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      growth: data.summary.growthRate,
    },
    {
      title: t("admin.analytics.revenue.totalOrders"),
      value: data.summary.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("admin.analytics.revenue.avgOrderValue"),
      value: formatCurrency(data.summary.avgOrderValue),
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("admin.analytics.revenue.platforms.comparison"),
      value: `${Object.keys(data.platforms).length}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: t("admin.analytics.revenue.platforms.comparison"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.growth && (
                <p
                  className={`text-xs ${
                    parseFloat(stat.growth) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {parseFloat(stat.growth) > 0 ? "+" : ""}
                  {stat.growth}% {t("admin.analytics.revenue.lastPeriod")}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              )}
              <Badge variant="secondary" className="mt-2">
                {t(`admin.analytics.timeRange.${timeRange}`)}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
