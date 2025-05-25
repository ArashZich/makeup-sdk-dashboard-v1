// src/components/dashboard/Header.tsx - آپدیت شده
"use client";

import { useUIStore } from "@/store/ui.store";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext"; // از context استفاده میکنیم
import { useAuthActions } from "@/api/hooks/useAuth"; // برای logout action
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";
import { Loader } from "@/components/common/Loader";
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
import { logger } from "@/lib/logger";

export function Header() {
  const { t, isRtl } = useLanguage();
  const { user } = useAuth(); // از context
  const { logout, isLoggingOut } = useAuthActions(); // از actions hook
  const { toggleSidebar, isSidebarOpen } = useUIStore();
  const router = useRouter();

  // استفاده از هوک برای دریافت تعداد اطلاعیه‌های خوانده نشده
  const { getUnreadCount } = useNotifications();
  const { hasUnread, count } = getUnreadCount();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error("Error logging out:", error);
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
              disabled={isLoggingOut}
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
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              disabled={isLoggingOut}
            >
              <User className="mr-2 h-4 w-4" />
              {t("profile.title")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              disabled={isLoggingOut}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("settings.title")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:text-destructive"
            >
              {isLoggingOut ? (
                <>
                  <Loader size="sm" variant="spinner" className="mr-2" />
                  {t("auth.loggingOut")}
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
