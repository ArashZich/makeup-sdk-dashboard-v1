// src/app/dashboard/admin/packages/[id]/page.tsx
import { Metadata } from "next";
import { PackageDetailsView } from "@/features/admin/packages/views/PackageDetailsView";

export const metadata: Metadata = {
  title: "Package Details | Admin Dashboard",
  description: "View and manage package details",
};

export default function PackageDetailsPage() {
  return <PackageDetailsView />;
}
