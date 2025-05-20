// src/features/admin/coupons/views/CouponsView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCoupons } from "@/api/hooks/useCoupons";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coupon } from "@/api/types/coupons.types";
import { CouponTable } from "../components/CouponTable";
import { DeleteCouponDialog } from "../components/DeleteCouponDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/common/Loader";
import { PlusIcon } from "lucide-react";

export function CouponsView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // استفاده از هوک useAdminCoupons برای دریافت و مدیریت کوپن‌ها
  const { getCoupons, deactivateCoupon, isDeactivatingCoupon } =
    useAdminCoupons();

  // دریافت لیست کوپن‌ها
  const { data: couponsData, isLoading, isError, refetch } = getCoupons();

  // مدیریت حذف کوپن
  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    try {
      await deactivateCoupon(couponToDelete._id);
      setCouponToDelete(null);
      refetch(); // به‌روزرسانی لیست کوپن‌ها پس از حذف
    } catch (error) {
      console.error("Error deactivating coupon:", error);
    }
  };

  // مدیریت کلیک روی دکمه حذف
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
  };

  // مدیریت انصراف از حذف
  const handleDeleteCancel = () => {
    setCouponToDelete(null);
  };

  // مدیریت کلیک روی دکمه افزودن کوپن جدید
  const handleAddCoupon = () => {
    router.push("/dashboard/admin/coupons/create");
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
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-destructive mb-4">{t("common.error.general")}</p>
        <Button onClick={() => refetch()}>{t("common.refresh")}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.coupons.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.coupons.description")}
          </p>
        </div>
        <Button onClick={handleAddCoupon}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("admin.coupons.addCoupon")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.coupons.manageCoupons")}</CardTitle>
        </CardHeader>
        <CardContent>
          {couponsData && couponsData.results ? (
            <CouponTable
              coupons={couponsData.results}
              onDeleteCoupon={handleDeleteClick}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {t("admin.coupons.noCoupons")}
              </p>
              <Button
                variant="outline"
                onClick={handleAddCoupon}
                className="mt-4"
              >
                {t("admin.coupons.addFirstCoupon")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* دیالوگ تأیید حذف کوپن */}
      <DeleteCouponDialog
        coupon={couponToDelete}
        isOpen={!!couponToDelete}
        isDeleting={isDeactivatingCoupon}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
