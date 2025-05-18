// src/features/notifications/components/NotificationFilters.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationType } from "@/api/types/notifications.types";
import { Label } from "@/components/ui/label";

interface NotificationFiltersProps {
  onFilterChange: (type: NotificationType | "all") => void;
  onReadFilterChange: (read: boolean | "all") => void;
  selectedType: NotificationType | "all";
  selectedRead: boolean | "all";
}

export function NotificationFilters({
  onFilterChange,
  onReadFilterChange,
  selectedType,
  selectedRead,
}: NotificationFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <div className="flex flex-col w-full sm:w-auto gap-1.5">
        <Label htmlFor="typeFilter">{t("notifications.filterByType")}</Label>
        <Select
          defaultValue={selectedType}
          onValueChange={(value) =>
            onFilterChange(value as NotificationType | "all")
          }
        >
          <SelectTrigger id="typeFilter" className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("notifications.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="expiry">
              {t("notifications.types.expiry")}
            </SelectItem>
            <SelectItem value="payment">
              {t("notifications.types.payment")}
            </SelectItem>
            <SelectItem value="system">
              {t("notifications.types.system")}
            </SelectItem>
            <SelectItem value="other">
              {t("notifications.types.other")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col w-full sm:w-auto gap-1.5">
        <Label htmlFor="readFilter">
          {t("notifications.filterByReadStatus")}
        </Label>
        <Select
          defaultValue={selectedRead.toString()}
          onValueChange={(value) => {
            if (value === "all") {
              onReadFilterChange("all");
            } else {
              onReadFilterChange(value === "true");
            }
          }}
        >
          <SelectTrigger id="readFilter" className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("notifications.filterByReadStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="false">{t("notifications.unread")}</SelectItem>
            <SelectItem value="true">{t("notifications.read")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
