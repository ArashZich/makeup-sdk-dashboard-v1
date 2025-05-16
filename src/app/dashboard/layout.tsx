// src/app/dashboard/layout.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK resources",
};

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
