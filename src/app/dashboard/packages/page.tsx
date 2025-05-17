// src/app/dashboard/packages/page.tsx
import { Metadata } from "next";
import { PackagesListView } from "@/features/packages/views/PackagesListView";

export const metadata: Metadata = {
  title: "Packages | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK packages",
};

export default function PackagesPage() {
  return <PackagesListView />;
}
