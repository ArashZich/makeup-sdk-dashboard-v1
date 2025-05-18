// src/app/dashboard/analytics/page.tsx
import { Metadata } from "next";
import { AnalyticsView } from "@/features/analytics/views/AnalyticsView";

export const metadata: Metadata = {
  title: "Analytics | Makeup SDK Dashboard",
  description: "View usage analytics and statistics",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
