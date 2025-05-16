// src/api/hooks/useCoupons.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsService } from "@/api/services/coupons-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CouponFilters,
  ValidateCouponRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/api/types/coupons.types";

/**
 * هوک برای استفاده از API کوپن‌ها برای کاربر عادی
 */
export const useCoupons = () => {
  const { t } = useLanguage();

  // بررسی اعتبار کوپن
  const validateCouponMutation = useMutation({
    mutationFn: (data: ValidateCouponRequest) =>
      couponsService.validateCoupon(data),
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    validateCoupon: validateCouponMutation.mutateAsync,
    isValidatingCoupon: validateCouponMutation.isPending,
    validationError: validateCouponMutation.error,
    validationResult: validateCouponMutation.data,
  };
};

/**
 * هوک برای استفاده از API کوپن‌ها برای ادمین
 */
export const useAdminCoupons = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت همه کوپن‌ها
  const getCoupons = (filters?: CouponFilters) => {
    return useQuery({
      queryKey: ["coupons", filters],
      queryFn: () => couponsService.getAllCoupons(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت کوپن با شناسه
  const getCoupon = (couponId: string) => {
    return useQuery({
      queryKey: ["coupon", couponId],
      queryFn: () => couponsService.getCouponById(couponId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ایجاد کوپن جدید
  const createCouponMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) =>
      couponsService.createCoupon(data),
    onSuccess: (data) => {
      // باطل کردن کش کوپن‌ها
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast.success(t("common.success.create"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی کوپن
  const updateCouponMutation = useMutation({
    mutationFn: ({
      couponId,
      data,
    }: {
      couponId: string;
      data: UpdateCouponRequest;
    }) => couponsService.updateCoupon(couponId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["coupon", data._id], data);
      // باطل کردن کش کوپن‌ها
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // غیرفعال‌سازی کوپن
  const deactivateCouponMutation = useMutation({
    mutationFn: (couponId: string) => couponsService.deactivateCoupon(couponId),
    onSuccess: (_, couponId) => {
      // باطل کردن کش
      queryClient.invalidateQueries({ queryKey: ["coupon", couponId] });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      showToast.success(
        t("admin.coupons.deactivateCoupon") + ": " + t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getCoupons,
    getCoupon,
    createCoupon: createCouponMutation.mutateAsync,
    updateCoupon: updateCouponMutation.mutateAsync,
    deactivateCoupon: deactivateCouponMutation.mutateAsync,
    isCreatingCoupon: createCouponMutation.isPending,
    isUpdatingCoupon: updateCouponMutation.isPending,
    isDeactivatingCoupon: deactivateCouponMutation.isPending,
  };
};
