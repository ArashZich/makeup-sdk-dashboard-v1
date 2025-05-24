// src/features/admin/notifications/components/NotificationStatsCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Users, Send } from "lucide-react";
import { Notification } from "@/api/types/notifications.types";

interface NotificationStatsCardProps {
  notifications: Notification[];
  isLoading?: boolean;
}

export function NotificationStatsCard({
  notifications,
  isLoading = false,
}: NotificationStatsCardProps) {
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
  const totalNotifications = notifications.length;

  const notificationsByType = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const notificationsByTarget = notifications.reduce((acc, notification) => {
    let targetType = "users";

    if (!notification.userId && !notification.planId) {
      targetType = "all";
    } else if (notification.planId) {
      targetType = "plan";
    }

    acc[targetType] = (acc[targetType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // آمار امروز (24 ساعت گذشته)
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayNotifications = notifications.filter(
    (notification) => new Date(notification.createdAt) > yesterday
  ).length;

  const stats = [
    {
      title: t("admin.notifications.stats.totalSent"),
      value: totalNotifications,
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("common.date"),
      value: todayNotifications,
      icon: Bell,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: t("analytics.thisMonth"), // استفاده از کلید موجود
    },
    {
      title: t("admin.notifications.stats.recipients"),
      value: notificationsByTarget.all || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: t("admin.notifications.targets.all"),
    },
    {
      title: t("admin.notifications.types.system"),
      value: notificationsByType.system || 0,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: t("admin.notifications.types.system"),
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

      {/* Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("admin.notifications.form.typeLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(notificationsByType).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-sm">
                {t(`admin.notifications.types.${type}`)}: {count}
              </Badge>
            ))}
            {Object.keys(notificationsByType).length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("admin.notifications.noNotifications")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("admin.notifications.form.targetLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(notificationsByTarget).map(([target, count]) => (
              <div key={target} className="flex items-center justify-between">
                <span className="text-sm">
                  {t(`admin.notifications.targets.${target}`)}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {Object.keys(notificationsByTarget).length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("admin.notifications.noNotifications")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
