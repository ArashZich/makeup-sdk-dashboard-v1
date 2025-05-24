// src/app/dashboard/admin/packages/page.tsx
import { Metadata } from "next";
import { PackagesView } from "@/features/admin/packages/views/PackagesView";

export const metadata: Metadata = {
  title: "Packages Management | Admin Dashboard",
  description: "Manage user packages in the admin dashboard",
};

export default function AdminPackagesPage() {
  return <PackagesView />;
}
