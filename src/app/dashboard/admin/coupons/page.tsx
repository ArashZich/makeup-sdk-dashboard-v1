// src/app/dashboard/admin/coupons/page.tsx
import { Metadata } from "next";
import { CouponsView } from "@/features/admin/coupons/views/CouponsView";

export const metadata: Metadata = {
  title: "Coupons Management | Admin Dashboard",
  description: "Manage discount coupons in the admin dashboard",
};

export default function CouponsPage() {
  return <CouponsView />;
}
