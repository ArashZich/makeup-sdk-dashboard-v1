// src/app/dashboard/page.tsx
import { Metadata } from "next";
import { DashboardOverview } from "@/features/dashboard/views/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK resources",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
