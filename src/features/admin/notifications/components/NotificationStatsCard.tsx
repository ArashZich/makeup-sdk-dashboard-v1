// src/features/admin/notifications/components/NotificationStatsCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Notification } from "@/api/types/notifications.types";
import { Bell, BellRing, Users, Send } from "lucide-react";

interface NotificationStatsCardProps {
  notifications: Notification[];
}

export function NotificationStatsCard({
  notifications,
}: NotificationStatsCardProps) {
  const { t } = useLanguage();

  // محاسبه آمار
  const totalNotifications = notifications.length;
  const readNotifications = notifications.filter((n) => n.read).length;
  const unreadNotifications = totalNotifications - readNotifications;

  // آمار بر اساس نوع
  const typeStats = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // کاربران منحصر به فرد دریافت‌کننده
  const uniqueUsers = new Set(
    notifications
      .map((n) => (typeof n.userId === "object" ? n.userId._id : n.userId))
      .filter(Boolean)
  ).size;

  const stats = [
    {
      title: t("admin.notifications.stats.totalSent"),
      value: totalNotifications.toLocaleString("fa-IR"),
      icon: Send,
      color: "text-blue-600",
    },
    {
      title: t("notifications.read"),
      value: readNotifications.toLocaleString("fa-IR"),
      icon: BellRing,
      color: "text-green-600",
    },
    {
      title: t("notifications.unread"),
      value: unreadNotifications.toLocaleString("fa-IR"),
      icon: Bell,
      color: "text-red-600",
    },
    {
      title: t("admin.notifications.stats.recipients"),
      value: uniqueUsers.toLocaleString("fa-IR"),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}

      {/* آمار بر اساس نوع */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>{t("admin.notifications.filters.filterByType")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-sm">
                {t(`admin.notifications.types.${type}`)}:{" "}
                {count.toLocaleString("fa-IR")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
