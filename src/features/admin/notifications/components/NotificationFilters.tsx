// src/features/admin/notifications/components/NotificationFilters.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationType } from "@/api/types/notifications.types";
import { RefreshCw } from "lucide-react";

interface NotificationFiltersProps {
  onFilterChange: (filters: {
    type?: NotificationType;
    read?: boolean;
  }) => void;
  isLoading?: boolean;
}

export function NotificationFilters({
  onFilterChange,
  isLoading = false,
}: NotificationFiltersProps) {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<NotificationType | "all">(
    "all"
  );
  const [selectedRead, setSelectedRead] = useState<"all" | "read" | "unread">(
    "all"
  );

  const handleTypeChange = (type: string) => {
    setSelectedType(type as NotificationType | "all");
    applyFilters(type as NotificationType | "all", selectedRead);
  };

  const handleReadChange = (read: string) => {
    setSelectedRead(read as "all" | "read" | "unread");
    applyFilters(selectedType, read as "all" | "read" | "unread");
  };

  const applyFilters = (
    type: NotificationType | "all",
    read: "all" | "read" | "unread"
  ) => {
    const filters: { type?: NotificationType; read?: boolean } = {};

    if (type !== "all") {
      filters.type = type;
    }

    if (read === "read") {
      filters.read = true;
    } else if (read === "unread") {
      filters.read = false;
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setSelectedType("all");
    setSelectedRead("all");
    onFilterChange({});
  };

  const notificationTypes: NotificationType[] = [
    "expiry",
    "payment",
    "system",
    "other",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.filter")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* فیلتر بر اساس نوع */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("admin.notifications.filters.filterByType")}
          </label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.notifications.filters.allTypes")}
              </SelectItem>
              {notificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`admin.notifications.types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* فیلتر بر اساس وضعیت خواندن */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("notifications.filterByReadStatus")}
          </label>
          <Select value={selectedRead} onValueChange={handleReadChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="read">{t("notifications.read")}</SelectItem>
              <SelectItem value="unread">
                {t("notifications.unread")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* دکمه ریست */}
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("common.reset")}
        </Button>
      </CardContent>
    </Card>
  );
}
