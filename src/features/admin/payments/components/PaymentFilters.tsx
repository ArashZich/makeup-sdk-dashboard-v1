"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/api/hooks/usePlans";
import { useAdminUsers } from "@/api/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter } from "lucide-react";
import { PaymentStatus } from "@/api/types/payments.types";

interface PaymentFiltersProps {
  onFiltersChange: (filters: {
    status?: PaymentStatus;
    planId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => void;
}

export function PaymentFilters({ onFiltersChange }: PaymentFiltersProps) {
  const { t } = useLanguage();

  const [activeFilters, setActiveFilters] = useState<{
    status?: PaymentStatus;
    planId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
  }>({});

  // Fetch plans and users for filters
  const { getAllPlans } = usePlans();
  const { getUsers } = useAdminUsers();

  const { data: plansData, isLoading: isLoadingPlans } = getAllPlans({
    active: true,
    limit: 100,
  });

  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 100,
  });

  const plans = plansData?.results || [];
  const users = usersData?.results || [];

  const handleFilterChange = (
    key: string,
    value: string | number | undefined
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
      case "status":
        return t(`admin.payments.status.${value}`);
      case "planId":
        const plan = plans.find((p) => p._id === value);
        return plan ? plan.name : value;
      case "userId":
        const user = users.find((u) => u._id === value);
        return user ? user.name : value;
      case "minAmount":
        return `${t(
          "admin.payments.filters.minAmount"
        )}: ${value.toLocaleString()}`;
      case "maxAmount":
        return `${t(
          "admin.payments.filters.maxAmount"
        )}: ${value.toLocaleString()}`;
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
        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.payments.filters.filterByStatus")}
            </Label>
            <Select
              value={activeFilters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.payments.filters.allStatuses")}
                </SelectItem>
                <SelectItem value="success">
                  {t("admin.payments.status.success")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("admin.payments.status.pending")}
                </SelectItem>
                <SelectItem value="failed">
                  {t("admin.payments.status.failed")}
                </SelectItem>
                <SelectItem value="canceled">
                  {t("admin.payments.status.canceled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.payments.filters.filterByPlan")}
            </Label>
            <Select
              value={activeFilters.planId || "all"}
              onValueChange={(value) => handleFilterChange("planId", value)}
              disabled={isLoadingPlans}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingPlans
                      ? t("common.loading")
                      : t("admin.payments.filters.allPlans")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.payments.filters.allPlans")}
                </SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.payments.filters.filterByUser")}
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
                      : t("admin.payments.filters.allUsers")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.payments.filters.allUsers")}
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} ({user.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.payments.filters.minAmount")}
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={activeFilters.minAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minAmount",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("admin.payments.filters.maxAmount")}
            </Label>
            <Input
              type="number"
              placeholder="1000000"
              value={activeFilters.maxAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxAmount",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
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
                {t("admin.payments.filters.reset")}
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
