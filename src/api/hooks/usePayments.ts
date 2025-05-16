// src/api/hooks/usePayments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/api/services/payments-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PaymentFilters,
  CreatePaymentRequest,
  PaymentStatus,
} from "@/api/types/payments.types";

/**
 * هوک برای استفاده از API پرداخت‌ها برای کاربر عادی
 */
export const useUserPayments = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ایجاد درخواست پرداخت
  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      paymentsService.createPayment(data),
    onSuccess: (data) => {
      // در اینجا کاربر را به صفحه پرداخت هدایت می‌کنیم
      if (typeof window !== "undefined" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // دریافت پرداخت‌های کاربر جاری با فیلتر وضعیت (اختیاری)
  const getUserPayments = (status?: PaymentStatus) => {
    return useQuery({
      queryKey: ["userPayments", status],
      queryFn: () => paymentsService.getCurrentUserPayments(status),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت پرداخت با شناسه
  const getPayment = (paymentId: string) => {
    return useQuery({
      queryKey: ["payment", paymentId],
      queryFn: () => paymentsService.getPaymentById(paymentId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // لغو پرداخت
  const cancelPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsService.cancelPayment(paymentId),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["payment", data.payment._id], data.payment);
      // باطل کردن کش پرداخت‌ها
      queryClient.invalidateQueries({ queryKey: ["userPayments"] });
      showToast.success(
        t("payments.cancelPayment") + ": " + t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    createPayment: createPaymentMutation.mutateAsync,
    getUserPayments,
    getPayment,
    cancelPayment: cancelPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    isCancelingPayment: cancelPaymentMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API پرداخت‌ها برای ادمین
 */
export const useAdminPayments = () => {
  const { t } = useLanguage();

  // دریافت همه پرداخت‌ها با فیلتر
  const getAllPayments = (filters?: PaymentFilters) => {
    return useQuery({
      queryKey: ["payments", filters],
      queryFn: () => paymentsService.getAllPayments(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  return {
    getAllPayments,
  };
};
