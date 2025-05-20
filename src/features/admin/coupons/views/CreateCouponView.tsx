// src/features/admin/coupons/views/CreateCouponView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAdminCoupons } from "@/api/hooks/useCoupons";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateCouponRequest } from "@/api/types/coupons.types";
import { CouponForm } from "../components/CouponForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function CreateCouponView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createCoupon, isCreatingCoupon } = useAdminCoupons();

  // مدیریت ارسال فرم ایجاد کوپن
  const handleSubmit = async (data: CreateCouponRequest) => {
    try {
      await createCoupon(data);
      router.push("/dashboard/admin/coupons");
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.coupons.addCoupon")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.coupons.addCouponDescription")}
          </p>
        </div>
      </div>

      <CouponForm isSubmitting={isCreatingCoupon} onSubmit={handleSubmit} />
    </div>
  );
}
