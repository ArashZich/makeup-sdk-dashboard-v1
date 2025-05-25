// src/features/admin/coupons/views/CreateCouponView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAdminCoupons } from "@/api/hooks/useCoupons";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/api/types/coupons.types";
import { CouponForm } from "../components/CouponForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logger from "@/lib/logger";

export function CreateCouponView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createCoupon, isCreatingCoupon } = useAdminCoupons();

  // ✅ اصلاح handleSubmit برای پشتیبانی از هر دو تایپ
  const handleSubmit = async (
    data: CreateCouponRequest | UpdateCouponRequest
  ) => {
    try {
      logger.api("Creating coupon with data:", data);

      // ✅ اطمینان از اینکه در حالت create، code موجود باشه
      if ("code" in data) {
        await createCoupon(data as CreateCouponRequest);
        logger.success("Coupon created successfully");
        router.push("/dashboard/admin/coupons");
      } else {
        logger.fail("Code is required for creating coupon");
        throw new Error("Code is required for creating coupon");
      }
    } catch (error) {
      logger.fail("Error creating coupon:", error);
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
