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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoolean } from "@/hooks/useBoolean"; // ✅ اضافه کردن import

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

  // 🔧 اصلاح: درست کردن استخراج داده‌ها
  const users = Array.isArray(usersData?.results) ? usersData.results : [];
  const plans = Array.isArray(plansData?.results) ? plansData.results : []; // اصلاح شده

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
        <Popover
          open={getValue("open")}
          onOpenChange={(open) => setValue("open", open)} // ✅ درست
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={getValue("open")}
              className="w-full justify-between"
              disabled={selectedUsers.length >= maxUsers}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} ${t("admin.users.title")} ${t(
                      "common.select"
                    )}`
                  : placeholder ||
                    t("admin.notifications.form.usersPlaceholder")}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandEmpty>
                {isLoadingUsers
                  ? t("common.loading")
                  : t("admin.users.noUsers")}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {users.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={user._id}
                      onSelect={() => handleUserSelect(user._id)}
                      disabled={
                        !selectedUsers.includes(user._id) &&
                        selectedUsers.length >= maxUsers
                      }
                      className="cursor-pointer"
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
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.phone}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

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
            ⚠️ حداکثر {maxUsers} کاربر قابل انتخاب است
          </p>
        )}
      </div>
    );
  }

  // Plan Mode
  if (mode === "plan") {
    // 🔧 اصلاح: اول بررسی کن که plans array هست یا نه
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
                      {plan.price.toLocaleString()} تومان • {plan.duration} روز
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
