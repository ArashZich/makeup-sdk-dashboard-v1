// src/features/admin/notifications/components/UserPlanSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { usePlans } from "@/api/hooks/usePlans";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X, Users, Package } from "lucide-react";
import { cn } from "@/lib/utils";

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
  maxUsers = 10,
}: UserPlanSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fetch users for user selection mode
  const { getUsers } = useAdminUsers();
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    name: searchValue,
    limit: 50,
  });

  // Fetch plans for plan selection mode
  const { getAllPlans } = usePlans();
  const { data: plansData, isLoading: isLoadingPlans } = getAllPlans({
    active: true,
  });

  const users = usersData?.results || [];
  const plans = plansData || [];

  // Users Mode
  if (mode === "users") {
    const handleUserSelect = (userId: string, userName: string) => {
      if (selectedUsers.includes(userId)) {
        // Remove user
        const newUsers = selectedUsers.filter((id) => id !== userId);
        onUsersChange?.(newUsers);
      } else if (selectedUsers.length < maxUsers) {
        // Add user
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
      .map((user) => ({ id: user._id, name: user.name }));

    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={selectedUsers.length >= maxUsers}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} ${t("admin.users.title")}`
                  : placeholder ||
                    t("admin.notifications.form.usersPlaceholder")}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder={t("admin.users.search")}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoadingUsers
                    ? t("common.loading")
                    : t("admin.users.noUsers")}
                </CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={user._id}
                      onSelect={() => handleUserSelect(user._id, user.name)}
                      disabled={
                        !selectedUsers.includes(user._id) &&
                        selectedUsers.length >= maxUsers
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedUsers.includes(user._id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.phone}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Users Display */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUserNames.map((user) => (
              <Badge key={user.id} variant="secondary" className="gap-1">
                {user.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeUser(user.id)}
                />
              </Badge>
            ))}
          </div>
        )}

        {selectedUsers.length >= maxUsers && (
          <p className="text-xs text-muted-foreground">
            {t("common.unlimited")} {maxUsers} {t("admin.users.title")}
          </p>
        )}
      </div>
    );
  }

  // Plan Mode
  if (mode === "plan") {
    const selectedPlanData = plans.find((plan) => plan._id === selectedPlan);

    const handlePlanSelect = (planId: string) => {
      onPlanChange?.(planId === selectedPlan ? "" : planId);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {selectedPlanData
                ? selectedPlanData.name
                : placeholder ||
                  t("admin.notifications.form.planSelectPlaceholder")}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t("plans.search")} />
            <CommandList>
              <CommandEmpty>
                {isLoadingPlans
                  ? t("common.loading")
                  : t("plans.noPlansAvailable")}
              </CommandEmpty>
              <CommandGroup>
                {plans.map((plan) => (
                  <CommandItem
                    key={plan._id}
                    value={plan._id}
                    onSelect={() => handlePlanSelect(plan._id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPlan === plan._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{plan.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.price.toLocaleString()} {t("common.currency")} -{" "}
                        {plan.duration} {t("common.days")}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
}
