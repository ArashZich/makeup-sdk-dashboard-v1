// src/features/notifications/components/NotificationCard.tsx
"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/api/types/notifications.types";
import { Bell, CheckCircle, Info, AlertTriangle, Zap } from "lucide-react";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead?: boolean;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}: NotificationCardProps) {
  const { t, isRtl } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // تابع برای نمایش آیکون مناسب بر اساس نوع اطلاعیه
  const getNotificationIcon = () => {
    switch (notification.type) {
      case "expiry":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "payment":
        return <Zap className="h-5 w-5 text-success" />;
      case "system":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // تابع برای تبدیل نوع اطلاعیه به متن قابل فهم
  const getNotificationType = () => {
    switch (notification.type) {
      case "expiry":
        return t("notifications.types.expiry");
      case "payment":
        return t("notifications.types.payment");
      case "system":
        return t("notifications.types.system");
      default:
        return t("notifications.types.other");
    }
  };

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      await onMarkAsRead(notification._id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`transition-colors ${
        notification.read
          ? "bg-card"
          : "bg-primary/5 dark:bg-primary/10 border-primary/20"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">
                {notification.title || getNotificationType()}
              </h3>
              {!notification.read && (
                <Badge variant="secondary" className="ms-2">
                  {t("notifications.unread")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              {formatRelativeTime(notification.createdAt, isRtl ? "fa" : "en")}
            </div>
          </div>
        </div>
      </CardContent>
      {!notification.read && (
        <CardFooter className="px-6 py-3 bg-card/50 border-t flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAsRead}
            disabled={isLoading || isMarkingAsRead}
          >
            {isLoading || isMarkingAsRead ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("notifications.markAsRead")}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
