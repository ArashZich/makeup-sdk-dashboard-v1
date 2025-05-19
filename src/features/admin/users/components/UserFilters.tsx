// src/features/admin/users/components/UserFilters.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserFilters as Filters } from "@/api/types/users.types";

interface UserFiltersProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const { t } = useLanguage();

  const handleRoleChange = (value: string) => {
    if (value === "all") {
      const { role, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...filters, role: value as "user" | "admin" });
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <Tabs
        defaultValue={filters.role || "all"}
        onValueChange={handleRoleChange}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{t("admin.users.tabs.all")}</TabsTrigger>
          <TabsTrigger value="admin">
            {t("admin.users.tabs.admins")}
          </TabsTrigger>
          <TabsTrigger value="user">{t("admin.users.tabs.users")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onFilterChange({})}>
          {t("common.reset")}
        </Button>
      </div>
    </div>
  );
}
