import { Metadata } from "next";
import { AdminAnalyticsView } from "@/features/admin/analytics/views/AdminAnalyticsView";

export const metadata: Metadata = {
  title: "Analytics & Revenue Stats | Admin Dashboard",
  description: "View comprehensive revenue and platform statistics",
};

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsView />;
}
