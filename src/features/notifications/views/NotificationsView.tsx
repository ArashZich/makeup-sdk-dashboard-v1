// src/features/notifications/views/NotificationsView.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationsList } from "../components/NotificationsList";

export function NotificationsView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("notifications.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("notifications.description")}
        </p>
      </div>

      <NotificationsList />
    </div>
  );
}
