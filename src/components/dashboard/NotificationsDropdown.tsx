// src/components/dashboard/NotificationsDropdown.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";

interface NotificationsDropdownProps {
  hasUnread?: boolean;
  count?: number;
}

export function NotificationsDropdown({
  hasUnread = false,
  count = 0,
}: NotificationsDropdownProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // این بخش بعداً با داده‌های واقعی از API جایگزین می‌شود
  const mockNotifications = [
    {
      id: "1",
      title: "بسته شما به زودی منقضی می‌شود",
      read: false,
      time: "30 دقیقه پیش",
    },
    {
      id: "2",
      title: "پرداخت شما با موفقیت انجام شد",
      read: true,
      time: "2 ساعت پیش",
    },
    {
      id: "3",
      title: "محصول جدید به سیستم اضافه شد",
      read: true,
      time: "دیروز",
    },
  ];

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

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{t("notifications.title")}</h3>
          <Button variant="ghost" size="sm" className="text-xs">
            {t("notifications.markAllAsRead")}
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <Loader type="pulse" size="sm" />
            </div>
          ) : mockNotifications.length > 0 ? (
            <AnimatePresence>
              {mockNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t("notifications.empty")}
              </p>
            </div>
          )}
        </div>

        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full text-sm">
            {t("notifications.viewAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
