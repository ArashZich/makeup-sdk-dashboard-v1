// src/app/dashboard/settings/page.tsx
import { Metadata } from "next";
import { SettingsView } from "@/features/settings/views/SettingsView";

export const metadata: Metadata = {
  title: "Settings | Makeup SDK Dashboard",
  description: "Manage your application settings",
};

export default function SettingsPage() {
  return <SettingsView />;
}
