// src/features/notifications/components/NotificationsList.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { NotificationCard } from "./NotificationCard";
import { NotificationFilters } from "./NotificationFilters";
import { CheckCircle, RefreshCcw } from "lucide-react";
import {
  Notification,
  NotificationType,
} from "@/api/types/notifications.types";
import { useNotifications } from "@/api/hooks/useNotifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

export function NotificationsList() {
  const { t } = useLanguage();
  const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const [selectedType, setSelectedType] = useState<NotificationType | "all">(
    "all"
  );
  const [selectedRead, setSelectedRead] = useState<boolean | "all">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // استفاده از هوک برای دریافت اطلاعیه‌ها با فیلترهای مناسب
  const { data, isLoading, error, refetch, isRefetching } =
    getUserNotifications({
      type: selectedType !== "all" ? selectedType : undefined,
      read: selectedRead !== "all" ? selectedRead : undefined,
      page,
      limit: 10,
    });

  // بررسی وجود صفحات بیشتر
  useEffect(() => {
    if (data) {
      setHasMore(data.page < data.totalPages);
    }
  }, [data]);

  // تغییر نوع فیلتر
  const handleTypeFilterChange = (type: NotificationType | "all") => {
    setSelectedType(type);
    setPage(1);
  };

  // تغییر فیلتر خوانده شده
  const handleReadFilterChange = (read: boolean | "all") => {
    setSelectedRead(read);
    setPage(1);
  };

  // علامت‌گذاری یک اطلاعیه به عنوان خوانده شده
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    refetch();
  };

  // علامت‌گذاری همه اطلاعیه‌ها به عنوان خوانده شده
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };

  // دریافت بیشتر اطلاعیه‌ها
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // بارگذاری مجدد اطلاعیه‌ها
  const handleRefresh = () => {
    refetch();
  };

  // بررسی آیا اطلاعیه‌های خوانده نشده وجود دارد
  const hasUnreadNotifications =
    data?.results?.some((notif) => !notif.read) || false;

  // بررسی آیا هیچ اطلاعیه‌ای وجود دارد
  const hasNoNotifications = !data?.results || data.results.length === 0;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t("common.error.title")}</AlertTitle>
        <AlertDescription>
          {t("notifications.error.fetchFailed")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("notifications.title")}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            {t("common.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={
              isLoading ||
              isRefetching ||
              isMarkingAllAsRead ||
              !hasUnreadNotifications
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t("notifications.markAllAsRead")}
          </Button>
        </div>
      </div>

      <NotificationFilters
        onFilterChange={handleTypeFilterChange}
        onReadFilterChange={handleReadFilterChange}
        selectedType={selectedType}
        selectedRead={selectedRead}
      />

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" text="common.loading" />
        </div>
      ) : hasNoNotifications ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t("notifications.empty")}</AlertTitle>
          <AlertDescription>
            {t("notifications.emptyDescription")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-4">
            {data?.results.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                isMarkingAsRead={isMarkingAsRead}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading || isRefetching}
              >
                {isLoading && page > 1 ? (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : null}
                {t("common.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
