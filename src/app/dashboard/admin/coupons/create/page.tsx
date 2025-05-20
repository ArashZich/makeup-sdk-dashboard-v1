// src/app/dashboard/admin/coupons/create/page.tsx
import { Metadata } from "next";
import { CreateCouponView } from "@/features/admin/coupons/views/CreateCouponView";

export const metadata: Metadata = {
  title: "Create Coupon | Admin Dashboard",
  description: "Create a new discount coupon in the admin dashboard",
};

export default function CreateCouponPage() {
  return <CreateCouponView />;
}
