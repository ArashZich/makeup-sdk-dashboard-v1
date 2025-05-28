// src/features/admin/notifications/components/UserPlanSelector.tsx
"use client";

import { useAdminUsers } from "@/api/hooks/useUsers";
import { usePlans } from "@/api/hooks/usePlans";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Users, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoolean } from "@/hooks/useBoolean";

interface UserPlanSelectorProps {
  mode: "users" | "plan";
  selectedUsers?: string[];
  selectedPlan?: string;
  onUsersChange?: (users: string[]) => void;
  onPlanChange?: (planId: string) => void;
  placeholder?: string;
  maxUsers?: number;
}

export function UserPlanSelector({
  mode,
  selectedUsers = [],
  selectedPlan = "",
  onUsersChange,
  onPlanChange,
  placeholder,
  maxUsers = 20,
}: UserPlanSelectorProps) {
  const { t } = useLanguage();

  const { getValue, setValue } = useBoolean({
    open: false,
  });

  // Fetch all users
  const { getUsers } = useAdminUsers();
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 1000,
  });

  // Fetch all plans
  const { getAllPlans } = usePlans();
  const { data: plansData, isLoading: isLoadingPlans } = getAllPlans({
    active: true,
  });

  // ✅ درست کردن استخراج داده‌ها
  const users = Array.isArray(usersData?.results) ? usersData.results : [];
  const plans = Array.isArray(plansData?.results) ? plansData.results : [];

  // Users Mode
  if (mode === "users") {
    const handleUserSelect = (userId: string) => {
      if (selectedUsers.includes(userId)) {
        const newUsers = selectedUsers.filter((id) => id !== userId);
        onUsersChange?.(newUsers);
      } else if (selectedUsers.length < maxUsers) {
        const newUsers = [...selectedUsers, userId];
        onUsersChange?.(newUsers);
      }
    };

    const removeUser = (userId: string) => {
      const newUsers = selectedUsers.filter((id) => id !== userId);
      onUsersChange?.(newUsers);
    };

    const selectedUserNames = users
      .filter((user) => selectedUsers.includes(user._id))
      .map((user) => ({ id: user._id, name: user.name, phone: user.phone }));

    return (
      <div className="space-y-3">
        {/* ✅ استفاده از Select به جای Popover برای یکدستی */}
        <Select
          open={getValue("open")}
          onOpenChange={(open) => setValue("open", open)}
          value="" // همیشه خالی چون multi-select هست
          onValueChange={handleUserSelect}
        >
          <SelectTrigger
            className="w-full"
            disabled={selectedUsers.length >= maxUsers}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <SelectValue
                placeholder={
                  selectedUsers.length > 0
                    ? `${selectedUsers.length} ${t("admin.users.title")} ${t(
                        "common.select"
                      )}`
                    : placeholder ||
                      t("admin.notifications.form.usersPlaceholder")
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent className="w-full">
            {isLoadingUsers ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                {t("common.loading")}...
              </div>
            ) : users.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                {t("admin.users.noUsers")}
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                {users.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  const isDisabled =
                    !isSelected && selectedUsers.length >= maxUsers;

                  return (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      disabled={isDisabled}
                      className={`cursor-pointer ${
                        isSelected ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.phone}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            {t("common.selected")}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </ScrollArea>
            )}
          </SelectContent>
        </Select>

        {/* Selected Users Display */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {t("admin.notifications.form.usersLabel")} ({selectedUsers.length}
              /{maxUsers}):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedUserNames.map((user) => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="gap-1 text-xs"
                >
                  <span>{user.name}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeUser(user.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedUsers.length >= maxUsers && (
          <p className="text-xs text-orange-600">
            {t("admin.notifications.form.maxUsersWarning", { maxUsers })}
          </p>
        )}
      </div>
    );
  }

  // Plan Mode
  if (mode === "plan") {
    const selectedPlanData =
      plans.length > 0 ? plans.find((plan) => plan._id === selectedPlan) : null;

    return (
      <Select value={selectedPlan} onValueChange={onPlanChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <SelectValue
              placeholder={
                placeholder ||
                t("admin.notifications.form.planSelectPlaceholder")
              }
            >
              {selectedPlanData?.name}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {isLoadingPlans ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              {t("common.loading")}...
            </div>
          ) : plans.length === 0 ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              {t("plans.noPlansAvailable")}
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              {plans.map((plan) => (
                <SelectItem key={plan._id} value={plan._id}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan.price.toLocaleString()} {t("common.currency.toman")}{" "}
                      • {plan.duration} {t("common.days")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          )}
        </SelectContent>
      </Select>
    );
  }

  return null;
}
