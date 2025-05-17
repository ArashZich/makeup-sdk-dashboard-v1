// src/app/dashboard/sdk/page.tsx
import { Metadata } from "next";
import { SdkDashboardView } from "@/features/sdk/views/SdkDashboardView";

export const metadata: Metadata = {
  title: "SDK Dashboard | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK integration",
};

export default function SdkPage() {
  return <SdkDashboardView />;
}
