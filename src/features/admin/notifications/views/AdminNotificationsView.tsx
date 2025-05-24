// src/features/admin/notifications/views/AdminNotificationsView.tsx
"use client";

import { useState, useMemo } from "react";
import { useAdminNotifications } from "@/api/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, RefreshCw } from "lucide-react";
import { SendNotificationForm } from "../components/SendNotificationForm";
import { NotificationTable } from "../components/NotificationTable";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationStatsCard } from "../components/NotificationStatsCard";
import { NotificationType } from "@/api/types/notifications.types";

export function AdminNotificationsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // اصلاح نوع filters
  const [filters, setFilters] = useState<{
    type?: NotificationType; // بجای string
    target?: string;
  }>({});

  // Fetch notifications
  const { getAllNotifications } = useAdminNotifications();

  // تبدیل filters به فرمت مناسب API
  const apiFilters = useMemo(() => {
    const result: any = {};

    if (filters.type) {
      result.type = filters.type;
    }

    // target رو نمی‌فرستیم به API چون client-side فیلتر می‌کنیم
    // فقط type رو می‌فرستیم

    return result;
  }, [filters.type]);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = getAllNotifications(apiFilters);

  const notifications = notificationsData?.results || [];

  // Memoized filtered data
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // type filter توی API اعمال میشه، اینجا نیازی نیست

    // فقط target filter رو client-side اعمال می‌کنیم
    if (filters.target) {
      filtered = filtered.filter((notification) => {
        if (filters.target === "all_users") {
          return !notification.userId && !notification.planId;
        }
        if (filters.target === "plan") {
          return !!notification.planId;
        }
        if (filters.target === "users") {
          return !!notification.userId;
        }
        return true;
      });
    }

    return filtered;
  }, [notifications, filters.target]);

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                {t("common.error.general")}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("common.refresh")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.notifications.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.notifications.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
          <TabsTrigger value="send">
            {t("admin.notifications.sendNotification")}
          </TabsTrigger>
          <TabsTrigger value="all">
            {t("admin.notifications.allNotifications")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <NotificationStatsCard
            notifications={filteredNotifications}
            isLoading={isLoading}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t("admin.notifications.allNotifications")}
                </CardTitle>
                <Button onClick={() => setActiveTab("send")} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.notifications.sendNotification")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationTable
                notifications={filteredNotifications.slice(0, 5)}
                isLoading={isLoading}
              />
              {filteredNotifications.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setActiveTab("all")}>
                    {t("notifications.viewAll")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Notification Tab */}
        <TabsContent value="send">
          <SendNotificationForm />
        </TabsContent>

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.notifications.allNotifications")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationFilters onFiltersChange={setFilters} />
              <Separator />
              <NotificationTable
                notifications={filteredNotifications}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
