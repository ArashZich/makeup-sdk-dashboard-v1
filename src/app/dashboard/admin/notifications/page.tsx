// src/app/dashboard/admin/notifications/page.tsx
import { Metadata } from "next";
import { AdminNotificationsView } from "@/features/admin/notifications/views/AdminNotificationsView";

export const metadata: Metadata = {
  title: "Notifications Management | Admin Dashboard",
  description: "Send and manage system notifications in the admin dashboard",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsView />;
}
