// src/features/admin/notifications/views/AdminNotificationsView.tsx
"use client";

import { useState, useMemo } from "react";
import { useAdminNotifications } from "@/api/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, RefreshCw } from "lucide-react"; // 🔄 اضافه شده
import { SendNotificationForm } from "../components/SendNotificationForm";
import { NotificationTable } from "../components/NotificationTable";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationStatsCard } from "../components/NotificationStatsCard";
import { NotificationType } from "@/api/types/notifications.types";
import { BackButtonIcon } from "@/components/common/BackButton";

export function AdminNotificationsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const [filters, setFilters] = useState<{
    type?: NotificationType;
    target?: string;
  }>({});

  // Fetch notifications
  const { getAllNotifications } = useAdminNotifications();

  const apiFilters = useMemo(() => {
    const result: any = {};

    if (filters.type) {
      result.type = filters.type;
    }

    return result;
  }, [filters.type]);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = getAllNotifications(apiFilters);

  const notifications = notificationsData?.results || [];

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

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

  // 🔄 اضافه شده: تابع بازگشت
  const handleBackToOverview = () => {
    setActiveTab("overview");
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
        <TabsContent value="send" className="space-y-6">
          {/* 🔄 اضافه شده: دکمه بازگشت */}
          <div className="flex items-center gap-2 mb-4">
            <BackButtonIcon onClick={handleBackToOverview} />
            <div>
              <h2 className="text-xl font-semibold">
                {t("admin.notifications.sendNotification")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.notifications.form.title")}
              </p>
            </div>
          </div>
          <SendNotificationForm />
        </TabsContent>

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* 🔄 اضافه شده: دکمه بازگشت */}
          <div className="flex items-center gap-2 mb-4">
            <BackButtonIcon onClick={handleBackToOverview} />
            <div>
              <h2 className="text-xl font-semibold">
                {t("admin.notifications.allNotifications")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.notifications.description")}
              </p>
            </div>
          </div>

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
