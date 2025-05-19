// src/features/admin/coupons/components/DeleteCouponDialog.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Coupon } from "@/api/types/coupons.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "@/components/common/Loader";

interface DeleteCouponDialogProps {
  coupon: Coupon | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteCouponDialog({
  coupon,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteCouponDialogProps) {
  const { t } = useLanguage();

  if (!coupon) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={() => !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.coupons.deleteCoupon")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.coupons.deleteCouponConfirmation", { code: coupon.code })}
            <div className="mt-2 text-sm">
              {t("admin.coupons.deleteWarning")}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? <Loader size="sm" className="mr-2" /> : null}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
