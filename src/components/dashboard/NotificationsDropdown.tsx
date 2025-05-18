// src/components/dashboard/NotificationsDropdown.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/api/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/date";

interface NotificationsDropdownProps {
  hasUnread?: boolean;
  count?: number;
}

export function NotificationsDropdown({
  hasUnread = false,
  count = 0,
}: NotificationsDropdownProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  // دریافت 5 اطلاعیه اخیر خوانده نشده
  const { data, isLoading, error, refetch } = getUserNotifications({
    read: false,
    limit: 5,
    page: 1,
  });

  // علامت‌گذاری یک اطلاعیه به عنوان خوانده شده
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // علامت‌گذاری همه اطلاعیه‌ها به عنوان خوانده شده
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // هدایت به صفحه همه اطلاعیه‌ها
  const navigateToAllNotifications = () => {
    setOpen(false);
    router.push("/dashboard/notifications");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />

          {/* نمایش تعداد نوتیفیکیشن‌های خوانده نشده */}
          {hasUnread && (
            <AnimatePresence>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
              >
                {count > 9 ? "9+" : count}
              </motion.span>
            </AnimatePresence>
          )}

          {/* انیمیشن زنگ برای نوتیفیکیشن جدید */}
          {hasUnread && (
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0)",
                  "0 0 0 4px rgba(239, 68, 68, 0.3)",
                  "0 0 0 8px rgba(239, 68, 68, 0)",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align={isRtl ? "start" : "end"}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{t("notifications.title")}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead || !hasUnread}
          >
            {isMarkingAllAsRead ? (
              <span className="h-3 w-3 mr-1 rounded-full animate-spin border-2 border-primary border-t-transparent" />
            ) : (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            {t("notifications.markAllAsRead")}
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Loader size="sm" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 text-sm">
              {t("common.error.general")}
            </div>
          ) : !data?.results || data.results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t("notifications.empty")}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {data.results.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatRelativeTime(
                          notification.createdAt,
                          isRtl ? "fa" : "en"
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
            onClick={navigateToAllNotifications}
          >
            {t("notifications.viewAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
