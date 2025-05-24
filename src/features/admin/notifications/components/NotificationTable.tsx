// src/features/admin/notifications/components/NotificationTable.tsx
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { Notification } from "@/api/types/notifications.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";
import { Eye, Users, User as UserIcon, Package } from "lucide-react";

interface NotificationTableProps {
  notifications: Notification[];
  isLoading?: boolean;
}

export function NotificationTable({
  notifications,
  isLoading = false,
}: NotificationTableProps) {
  const { t } = useLanguage();

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

  const getRecipientInfo = (notification: Notification) => {
    // Check if sent to all users
    if (!notification.userId && !notification.planId) {
      return {
        type: "all",
        label: t("admin.notifications.targets.all"),
        icon: Users,
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
      };
    }

    // Sent to specific user
    if (notification.userId) {
      const userName =
        typeof notification.userId === "string"
          ? notification.userId
          : (notification.userId as User).name;

      return {
        type: "user",
        label: userName,
        icon: UserIcon,
      };
    }

    return {
      type: "unknown",
      label: "نامشخص",
      icon: UserIcon,
    };
  };

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "title",
      header: () => t("admin.notifications.form.titleLabel"),
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{row.original.title}</div>
          <div className="text-sm text-muted-foreground truncate">
            {row.original.message}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => t("admin.notifications.form.typeLabel"),
      cell: ({ row }) => (
        <Badge variant={getTypeVariant(row.original.type)}>
          {t(`admin.notifications.types.${row.original.type}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "recipient",
      header: () => t("admin.notifications.table.recipient"),
      cell: ({ row }) => {
        const recipientInfo = getRecipientInfo(row.original);
        const IconComponent = recipientInfo.icon;

        return (
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{recipientInfo.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => t("admin.notifications.table.sentAt"),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => t("common.actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            // TODO: View notification details
            console.log("View notification:", row.original._id);
          }}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">{t("common.view")}</span>
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={notifications}
      searchKey="title"
      searchPlaceholder={t("admin.notifications.searchPlaceholder")}
      noResultsText={t("admin.notifications.noNotifications")}
      pagination={true}
      pageSize={10}
    />
  );
}
