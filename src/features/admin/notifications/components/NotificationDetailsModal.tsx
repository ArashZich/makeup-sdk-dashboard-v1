"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { Notification } from "@/api/types/notifications.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";
import { Copy, Bell, User as UserIcon, Package, Users } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface NotificationDetailsModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDetailsModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailsModalProps) {
  const { t } = useLanguage();
  const { copyToClipboard } = useClipboard();

  if (!notification) return null;

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "expiry":
        return "destructive";
      case "payment":
        return "default";
      case "system":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRecipientInfo = () => {
    // Check if sent to all users
    if (!notification.userId && !notification.planId) {
      return {
        type: "all",
        label: t("admin.notifications.targets.all"),
        icon: Users,
        description: t("admin.notifications.details.sentToAll"),
      };
    }

    // Check if sent to plan users
    if (notification.planId) {
      const planName =
        typeof notification.planId === "string"
          ? notification.planId
          : (notification.planId as Plan).name;

      return {
        type: "plan",
        label: `${t("admin.notifications.targets.plan")}: ${planName}`,
        icon: Package,
        description: t("admin.notifications.details.sentToPlanUsers"),
      };
    }

    // Sent to specific user
    if (notification.userId) {
      const userName =
        typeof notification.userId === "string"
          ? notification.userId
          : (notification.userId as User).name;

      const userPhone =
        typeof notification.userId === "string"
          ? ""
          : (notification.userId as User).phone;

      return {
        type: "user",
        label: userName,
        phone: userPhone,
        icon: UserIcon,
        description: t("admin.notifications.details.sentToUser"),
      };
    }

    return {
      type: "unknown",
      label: t("common.unknown"),
      icon: UserIcon,
      description: "",
    };
  };

  const recipientInfo = getRecipientInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("admin.notifications.details.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.notifications.form.typeLabel")}
              </label>
              <div className="mt-1">
                <Badge variant={getTypeVariant(notification.type)}>
                  {t(`admin.notifications.types.${notification.type}`)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.notifications.details.notificationId")}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm">
                  {notification._id.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(notification._id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message Content */}
          <div>
            <h3 className="font-medium mb-3">
              {t("admin.notifications.details.messageContent")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.form.titleLabel")}
                </label>
                <p className="mt-1 font-medium">{notification.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.form.messageLabel")}
                </label>
                <div className="mt-1 p-3 bg-muted/50 rounded-md">
                  <p className="whitespace-pre-wrap">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipient Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {React.createElement(recipientInfo.icon, {
                className: "h-4 w-4",
              })}
              <h3 className="font-medium">
                {t("admin.notifications.details.recipientInfo")}
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.details.sentTo")}
                </label>
                <p className="mt-1">{recipientInfo.label}</p>
                {recipientInfo.phone && (
                  <p className="text-sm text-muted-foreground">
                    {recipientInfo.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.details.targetType")}
                </label>
                <p className="mt-1">{recipientInfo.description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          {notification.metadata &&
            Object.keys(notification.metadata).length > 0 && (
              <>
                <div>
                  <h3 className="font-medium mb-3">
                    {t("admin.notifications.details.metadata")}
                  </h3>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(notification.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Dates */}
          <div>
            <h3 className="font-medium mb-3">
              {t("admin.notifications.details.dates")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.details.sentAt")}
                </label>
                <p className="mt-1">{formatDate(notification.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.notifications.details.readStatus")}
                </label>
                <div className="mt-1">
                  <Badge variant={notification.read ? "default" : "secondary"}>
                    {notification.read
                      ? t("admin.notifications.details.read")
                      : t("admin.notifications.details.unread")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
