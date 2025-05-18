// src/app/dashboard/notifications/page.tsx
import { Metadata } from "next";
import { NotificationsView } from "@/features/notifications/views/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | Makeup SDK Dashboard",
  description: "View and manage your notifications",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
