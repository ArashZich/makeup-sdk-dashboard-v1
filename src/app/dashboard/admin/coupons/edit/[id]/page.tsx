// src/app/dashboard/admin/coupons/edit/[id]/page.tsx
import { Metadata } from "next";
import { EditCouponView } from "@/features/admin/coupons/views/EditCouponView";

export const metadata: Metadata = {
  title: "Edit Coupon | Admin Dashboard",
  description: "Edit a discount coupon in the admin dashboard",
};

export default function EditCouponPage() {
  return <EditCouponView />;
}
