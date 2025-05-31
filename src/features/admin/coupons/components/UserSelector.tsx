// src/features/admin/coupons/components/UserSelector.tsx
"use client";

import { useState } from "react";
import { useAdminUsers } from "@/api/hooks/useUsers";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/common/Loader";
import { Plus, X, Users, Search } from "lucide-react";
import { User } from "@/api/types/users.types";

interface UserSelectorProps {
  selectedUserIds: string[];
  onUsersChange: (userIds: string[]) => void;
  placeholder?: string;
}

export function UserSelector({
  selectedUserIds,
  onUsersChange,
  placeholder,
}: UserSelectorProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // دریافت لیست تمام کاربران
  const { getUsers } = useAdminUsers();
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 1000, // دریافت تمام کاربران
  });

  const users = Array.isArray(usersData?.results) ? usersData.results : [];

  // فیلتر کردن کاربران بر اساس جستجو
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  // کاربران انتخاب شده
  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user._id)
  );

  // افزودن کاربر
  const handleAddUser = (userId: string) => {
    if (!selectedUserIds.includes(userId)) {
      onUsersChange([...selectedUserIds, userId]);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  // حذف کاربر
  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUserIds.filter((id) => id !== userId));
  };

  // پاک کردن همه انتخاب‌ها
  const handleClearAll = () => {
    onUsersChange([]);
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader size="md" text="common.loading" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* انتخابگر کاربر */}
      <div className="flex gap-2">
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          value=""
          onValueChange={handleAddUser}
        >
          <SelectTrigger className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <SelectValue
                placeholder={
                  placeholder || t("admin.coupons.userIdPlaceholder")
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent className="w-full">
            {/* جستجو */}
            <div className="flex items-center border-b px-3 pb-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={t("admin.users.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* لیست کاربران */}
            <ScrollArea className="h-[300px]">
              {filteredUsers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {searchTerm
                    ? t("admin.users.noUsers")
                    : t("admin.users.noUsers")}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user._id);
                  return (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      disabled={isSelected}
                      className={`cursor-pointer ${
                        isSelected ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.phone}
                            {user.email && ` • ${user.email}`}
                          </span>
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {t("common.selected")}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </ScrollArea>
          </SelectContent>
        </Select>

        {/* دکمه پاک کردن همه */}
        {selectedUserIds.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* نمایش کاربران انتخاب شده */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {t("admin.coupons.currentUsers")} ({selectedUsers.length})
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs opacity-70">{user.phone}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => handleRemoveUser(user._id)}
                >
                  <X className="h-3 w-3 text-destructive hover:text-destructive/80" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* پیام خالی بودن */}
      {selectedUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("admin.coupons.noUsersAdded")}
        </p>
      )}
    </div>
  );
}
