// src/features/admin/coupons/views/EditCouponView.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdminCoupons } from "@/api/hooks/useCoupons";
import { useLanguage } from "@/contexts/LanguageContext";
import { UpdateCouponRequest } from "@/api/types/coupons.types";
import { CouponForm } from "../components/CouponForm";
import { Loader } from "@/components/common/Loader";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";

export function EditCouponView() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const { getCoupon, updateCoupon, isUpdatingCoupon } = useAdminCoupons();
  const { data: coupon, isLoading, isError } = getCoupon(couponId);

  // مدیریت ارسال فرم ویرایش کوپن
  const handleSubmit = async (data: UpdateCouponRequest) => {
    try {
      await updateCoupon({ couponId, data });
      router.push("/dashboard/admin/coupons");
    } catch (error) {
      logger.error("Error updating coupon:", error);
    }
  };

  // نمایش وضعیت بارگذاری
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  // نمایش خطا
  if (isError || !coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-destructive mb-4">{t("common.error.general")}</p>
        <BackButtonIcon onClick={() => router.back()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BackButtonIcon onClick={() => router.back()} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.coupons.editCoupon")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.coupons.editCouponDescription")}
          </p>
        </div>
      </div>

      <CouponForm
        coupon={coupon}
        isSubmitting={isUpdatingCoupon}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
