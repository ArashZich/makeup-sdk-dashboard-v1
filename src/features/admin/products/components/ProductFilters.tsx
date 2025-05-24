// src/features/admin/products/components/ProductFilters.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { ProductType, getAllProductTypes } from "@/constants/product-patterns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter } from "lucide-react";

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    userId?: string;
    type?: ProductType;
    active?: boolean;
  }) => void;
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const { t } = useLanguage();

  const [activeFilters, setActiveFilters] = useState<{
    userId?: string;
    type?: ProductType;
    active?: boolean;
  }>({});

  // Fetch users for filter
  const { getUsers } = useAdminUsers();
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 100,
  });

  const users = usersData?.results || [];

  // ✅ استفاده از constants برای انواع محصولات
  const productTypes: { value: ProductType; label: string }[] =
    getAllProductTypes().map((type) => ({
      value: type,
      label: t(`admin.products.types.${type}`),
    }));

  const handleFilterChange = (
    key: string,
    value: string | boolean | undefined
  ) => {
    const newFilters = {
      ...activeFilters,
      [key]: value === "all" || value === "" ? undefined : value,
    };

    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key as keyof typeof newFilters];
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (value) => value !== undefined && value !== ""
  ).length;

  const getFilterLabel = (key: string, value: any) => {
    switch (key) {
      case "userId":
        const user = users.find((u) => u._id === value);
        return user ? user.name : value;
      case "type":
        return t(`admin.products.types.${value}`);
      case "active":
        return value
          ? t("admin.products.status.active")
          : t("admin.products.status.inactive");
      default:
        return value;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("common.filters")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.products.filters.filterByUser")}
            </Label>
            <Select
              value={activeFilters.userId || "all"}
              onValueChange={(value) => handleFilterChange("userId", value)}
              disabled={isLoadingUsers}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingUsers
                      ? t("common.loading")
                      : t("admin.products.filters.allUsers")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.products.filters.allUsers")}
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} ({user.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.products.filters.filterByType")}
            </Label>
            <Select
              value={activeFilters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.products.filters.allTypes")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.products.filters.allTypes")}
                </SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.products.filters.filterByStatus")}
            </Label>
            <Select
              value={
                activeFilters.active === undefined
                  ? "all"
                  : activeFilters.active
                  ? "active"
                  : "inactive"
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "active",
                  value === "all" ? undefined : value === "active"
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.products.filters.allStatuses")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.products.filters.allStatuses")}
                </SelectItem>
                <SelectItem value="active">
                  {t("admin.products.status.active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("admin.products.status.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("common.activeFilters")} ({activeFilterCount})
              </span>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                {t("admin.products.filters.reset")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => {
                if (value === undefined || value === "") return null;
                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {getFilterLabel(key, value)}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter(key)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
