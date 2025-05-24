// src/features/admin/notifications/components/NotificationFilters.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { NotificationType } from "@/api/types/notifications.types";

interface NotificationFiltersProps {
  onFiltersChange: (filters: {
    type?: NotificationType; // اصلاح شده
    target?: string;
  }) => void;
}

export function NotificationFilters({
  onFiltersChange,
}: NotificationFiltersProps) {
  const { t } = useLanguage();
  const [activeFilters, setActiveFilters] = useState<{
    type?: NotificationType; // اصلاح شده
    target?: string;
  }>({});

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = {
      ...activeFilters,
      [key]: value === "all" ? undefined : value,
    };

    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("admin.notifications.filters.filterByType")}
          </label>
          <Select
            value={activeFilters.type || "all"}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.notifications.filters.allTypes")}
              </SelectItem>
              <SelectItem value="expiry">
                {t("admin.notifications.types.expiry")}
              </SelectItem>
              <SelectItem value="payment">
                {t("admin.notifications.types.payment")}
              </SelectItem>
              <SelectItem value="system">
                {t("admin.notifications.types.system")}
              </SelectItem>
              <SelectItem value="other">
                {t("admin.notifications.types.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("admin.notifications.filters.filterByTarget")}
          </label>
          <Select
            value={activeFilters.target || "all"}
            onValueChange={(value) => handleFilterChange("target", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.notifications.filters.allTargets")}
              </SelectItem>
              <SelectItem value="all_users">
                {t("admin.notifications.targets.all")}
              </SelectItem>
              <SelectItem value="plan">
                {t("admin.notifications.targets.plan")}
              </SelectItem>
              <SelectItem value="users">
                {t("admin.notifications.targets.users")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="mt-6"
          >
            <X className="h-4 w-4 mr-2" />
            {t("common.reset")} ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.type && (
            <Badge variant="secondary" className="gap-1">
              {t(`admin.notifications.types.${activeFilters.type}`)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("type", undefined)}
              />
            </Badge>
          )}
          {activeFilters.target && (
            <Badge variant="secondary" className="gap-1">
              {activeFilters.target === "all_users"
                ? t("admin.notifications.targets.all")
                : t(`admin.notifications.targets.${activeFilters.target}`)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("target", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
