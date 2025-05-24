// src/app/dashboard/admin/packages/create/page.tsx
import { Metadata } from "next";
import { CreatePackageView } from "@/features/admin/packages/views/CreatePackageView";

export const metadata: Metadata = {
  title: "Create Package | Admin Dashboard",
  description: "Create a new package for users",
};

export default function CreatePackagePage() {
  return <CreatePackageView />;
}
