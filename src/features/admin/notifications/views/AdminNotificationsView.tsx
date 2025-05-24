// src/features/admin/notifications/views/AdminNotificationsView.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminNotifications } from "@/api/hooks/useNotifications";
import { NotificationTable } from "../components/NotificationTable";
import { SendNotificationForm } from "../components/SendNotificationForm";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationStatsCard } from "../components/NotificationStatsCard";
import { Send, List } from "lucide-react";
import {
  SendNotificationRequest,
  NotificationType,
} from "@/api/types/notifications.types";

export function AdminNotificationsView() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<{
    type?: NotificationType;
    read?: boolean;
  }>({});

  // دریافت اطلاعیه‌ها
  const { getAllNotifications } = useAdminNotifications();
  const { data: notificationsData, isLoading } = getAllNotifications(filters);

  // ارسال اطلاعیه
  const { sendNotification, isSendingNotification } = useAdminNotifications();

  const handleSendNotification = async (data: SendNotificationRequest) => {
    try {
      await sendNotification(data);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleFilterChange = (newFilters: {
    type?: NotificationType;
    read?: boolean;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.notifications.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.notifications.description")}
        </p>
      </div>

      {/* آمار اطلاعیه‌ها */}
      {notificationsData?.results && (
        <NotificationStatsCard notifications={notificationsData.results} />
      )}

      {/* تب‌های اصلی */}
      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center">
            <Send className="mr-2 h-4 w-4" />
            {t("admin.notifications.sendNotification")}
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="mr-2 h-4 w-4" />
            {t("admin.notifications.allNotifications")}
          </TabsTrigger>
        </TabsList>

        {/* تب ارسال اطلاعیه */}
        <TabsContent value="send">
          <div className="max-w-2xl">
            <SendNotificationForm
              onSubmit={handleSendNotification}
              isLoading={isSendingNotification}
            />
          </div>
        </TabsContent>

        {/* تب لیست اطلاعیه‌ها */}
        <TabsContent value="list">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* فیلترها */}
            <div className="lg:col-span-1">
              <NotificationFilters
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </div>

            {/* جدول اطلاعیه‌ها */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("admin.notifications.allNotifications")}
                  </CardTitle>
                  <CardDescription>
                    {notificationsData?.totalResults || 0} {t("common.entries")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationTable
                    notifications={notificationsData?.results || []}
                    isLoading={isLoading}
                    onViewDetails={(id) => console.log("View details:", id)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
