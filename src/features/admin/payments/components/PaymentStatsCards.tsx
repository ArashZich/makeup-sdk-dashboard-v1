"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { Payment } from "@/api/types/payments.types";

interface PaymentStatsCardsProps {
  payments: Payment[];
  isLoading: boolean;
}

export function PaymentStatsCards({
  payments,
  isLoading,
}: PaymentStatsCardsProps) {
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

  // محاسبه آمارها
  const totalPayments = payments.length;
  const successfulPayments = payments.filter(
    (p) => p.status === "success"
  ).length;
  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);
  const successRate =
    totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

  // آمار امروز (24 ساعت گذشته)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayPayments = payments.filter(
    (payment) => new Date(payment.createdAt) > yesterday
  ).length;

  const stats = [
    {
      title: t("admin.payments.stats.totalPayments"),
      value: totalPayments.toLocaleString(),
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: `${todayPayments} ${t("common.today")}`,
    },
    {
      title: t("admin.payments.stats.totalRevenue"),
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: t("admin.payments.status.success"),
    },
    {
      title: t("admin.payments.stats.successfulPayments"),
      value: successfulPayments.toLocaleString(),
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: `${t("common.from")} ${totalPayments}`,
    },
    {
      title: t("admin.payments.stats.successRate"),
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: t("admin.payments.stats.successRate"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
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
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("admin.payments.filters.filterByStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["success", "pending", "failed", "canceled"].map((status) => {
              const count = payments.filter((p) => p.status === status).length;
              const percentage =
                totalPayments > 0 ? (count / totalPayments) * 100 : 0;

              return (
                <Badge
                  key={status}
                  variant={status === "success" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {t(`admin.payments.status.${status}`)}: {count} (
                  {percentage.toFixed(1)}%)
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
