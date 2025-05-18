// src/components/dashboard/Header.tsx
"use client";

import { useState } from "react";
import { useUIStore } from "@/store/ui.store";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";
import { User, LogOut, Settings, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/api/hooks/useNotifications";

export function Header() {
  const { t, isRtl } = useLanguage();
  const { user, logout } = useAuth();
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const router = useRouter();

  // استفاده از هوک جدید برای دریافت تعداد اطلاعیه‌های خوانده نشده
  const { getUnreadCount } = useNotifications();
  const { hasUnread, count } = getUnreadCount();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 bg-background z-10">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label={
            isSidebarOpen ? t("common.closeSidebar") : t("common.openSidebar")
          }
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        <h1 className="text-lg font-medium hidden md:block">
          {t("dashboard.title")}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <NotificationsDropdown hasUnread={hasUnread} count={count} />

        <ThemeSwitcher />

        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user?.name || t("common.welcome")}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || user?.phone}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              {t("profile.title")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("settings.title")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
