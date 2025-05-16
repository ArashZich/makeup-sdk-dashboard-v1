// src/components/dashboard/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui.store";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/api/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/config/dashboard-nav";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const { t, isRtl } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // بررسی دسترسی کاربر به آیتم‌های منو
  const hasPermission = (permission: "user" | "admin" | "all") => {
    if (permission === "all") return true;
    if (permission === "admin" && user?.role === "admin") return true;
    if (permission === "user" && user?.role === "user") return true;
    return false;
  };

  // باز کردن گروه منو برای آیتمی که در مسیر فعلی است
  useEffect(() => {
    if (pathname) {
      dashboardNavItems.forEach((group) => {
        group.items.forEach((item) => {
          if (
            pathname === item.path ||
            (item.children &&
              item.children.some((child) => pathname === child.path))
          ) {
            setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
          }
        });
      });
    }
  }, [pathname]);

  // تغییر وضعیت باز/بسته گروه منو
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // تعیین فعال بودن آیتم منو
  const isActive = (path: string) => {
    return pathname === path;
  };

  // بستن سایدبار در حالت موبایل هنگام کلیک
  const handleItemClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // انیمیشن باز/بسته شدن سایدبار
  const sidebarVariants = {
    open: {
      x: 0,
      width: "16rem",
      transition: { duration: 0.3 },
    },
    closed: {
      x: isRtl ? "100%" : "-100%",
      width: 0,
      transition: { duration: 0.3 },
    },
  };

  // اگر سایدبار بسته باشد و در حالت دسکتاپ باشیم، تنها نوار کناری باریک را نمایش می‌دهیم
  if (!isSidebarOpen && !isMobile) {
    return (
      <div
        className={`w-16 h-screen border-${
          isRtl ? "start" : "end"
        } border-border bg-sidebar shrink-0 hidden lg:flex flex-col items-center py-6 gap-4`}
      >
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
          MS
        </div>

        <Separator className="w-10" />

        <div className="flex flex-col gap-4 items-center">
          {dashboardNavItems.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              {group.items
                .filter((item) => hasPermission(item.permission ?? "all"))
                .map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative h-10 w-10 rounded-lg",
                      isActive(item.path)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground"
                    )}
                    asChild
                  >
                    <Link href={item.path} onClick={handleItemClick}>
                      <item.icon size={20} />
                      {item.badge && (
                        <Badge
                          variant={
                            item.badge.variant === "danger"
                              ? "destructive"
                              : "default"
                          }
                          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay in mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className={`w-64 h-screen border-${
              isRtl ? "start" : "end"
            } border-border bg-sidebar text-sidebar-foreground flex flex-col z-50 fixed lg:relative start-0 top-0`}
            initial={isMobile ? "closed" : "open"}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  MS
                </div>
                <h1 className="font-semibold">{t("dashboard.title")}</h1>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleSidebar}
              >
                <X size={18} />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-2 py-4">
                {dashboardNavItems.map((group) => (
                  <div key={group.id} className="mb-4">
                    {group.title && (
                      <div className="px-3 mb-2">
                        <h2 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                          {t(group.title)}
                        </h2>
                      </div>
                    )}

                    <div className="space-y-1">
                      {group.items
                        .filter((item) =>
                          hasPermission(item.permission ?? "all")
                        )
                        .map((item) => (
                          <div key={item.id}>
                            {item.children ? (
                              <div>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-between text-sm px-3 py-2",
                                    isActive(item.path)
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground"
                                  )}
                                  onClick={() => toggleGroup(item.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <item.icon size={18} />
                                    <span>{t(item.label)}</span>
                                  </div>
                                  {isRtl ? (
                                    <ChevronLeft
                                      size={16}
                                      className={cn(
                                        "transition",
                                        openGroups[item.id] ? "rotate-90" : ""
                                      )}
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={16}
                                      className={cn(
                                        "transition",
                                        openGroups[item.id] ? "rotate-90" : ""
                                      )}
                                    />
                                  )}
                                </Button>

                                <AnimatePresence>
                                  {openGroups[item.id] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className={`ps-8 py-1 space-y-1`}>
                                        {item.children
                                          .filter((child) =>
                                            hasPermission(
                                              child.permission ?? "all"
                                            )
                                          )
                                          .map((child) => (
                                            <Button
                                              key={child.id}
                                              variant="ghost"
                                              className={cn(
                                                "w-full justify-start text-sm px-3 py-2",
                                                isActive(child.path)
                                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                  : "text-sidebar-foreground"
                                              )}
                                              asChild
                                            >
                                              <Link
                                                href={child.path}
                                                onClick={handleItemClick}
                                              >
                                                {t(child.label)}
                                              </Link>
                                            </Button>
                                          ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm px-3 py-2",
                                  isActive(item.path)
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground"
                                )}
                                asChild
                              >
                                <Link
                                  href={item.path}
                                  onClick={handleItemClick}
                                  className="flex items-center gap-2"
                                >
                                  <item.icon size={18} />
                                  <span>{t(item.label)}</span>
                                  {item.badge && (
                                    <Badge
                                      variant={
                                        item.badge.variant === "danger"
                                          ? "destructive"
                                          : "default"
                                      }
                                      className="ms-auto"
                                    >
                                      {item.badge.text}
                                    </Badge>
                                  )}
                                </Link>
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {user ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email || user?.phone}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
