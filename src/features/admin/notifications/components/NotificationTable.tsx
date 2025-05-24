// src/features/admin/notifications/components/NotificationTable.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Notification } from "@/api/types/notifications.types";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { MoreHorizontal, Eye, User } from "lucide-react";
import { Loader } from "@/components/common/Loader";

interface NotificationTableProps {
  notifications: Notification[];
  isLoading?: boolean;
  onViewDetails?: (notificationId: string) => void;
}

export function NotificationTable({
  notifications,
  isLoading = false,
  onViewDetails,
}: NotificationTableProps) {
  const { t } = useLanguage();

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "title",
      header: t("notifications.title"),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "message",
      header: t("notifications.message"),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.original.message}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: t("notifications.type"),
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant="outline">
            {t(`admin.notifications.types.${type}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "userId",
      header: t("admin.notifications.table.recipient"),
      cell: ({ row }) => {
        const user = row.original.userId;
        if (typeof user === "object") {
          return (
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {user.name}
            </div>
          );
        }
        return (
          <Badge variant="secondary">
            {t("admin.notifications.sendToAll")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "read",
      header: t("notifications.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.read ? "default" : "destructive"}>
          {row.original.read
            ? t("notifications.read")
            : t("notifications.unread")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("admin.notifications.table.sentAt"),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem
                  onClick={() => onViewDetails(notification._id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("admin.notifications.viewDetails")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DataTable
      columns={columns}
      data={notifications}
      searchKey="title"
      searchPlaceholder={t("admin.notifications.searchPlaceholder")}
      noResultsText={t("admin.notifications.noNotifications")}
    />
  );
}
