// src/api/services/payments-service.ts
import axios from "@/lib/axios";
import {
  Payment,
  PaymentFilters,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaginatedPayments,
} from "@/api/types/payments.types";

export const paymentsService = {
  /**
   * ایجاد درخواست پرداخت
   * @param data اطلاعات درخواست پرداخت
   */
  createPayment: async (
    data: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> => {
    const response = await axios.post("/payments", data);
    return response.data;
  },

  /**
   * دریافت پرداخت‌های کاربر جاری
   * @param status فیلتر وضعیت (اختیاری)
   */
  getCurrentUserPayments: async (
    status?: string
  ): Promise<PaginatedPayments> => {
    const response = await axios.get("/payments/me", { params: { status } });
    return response.data;
  },

  /**
   * دریافت پرداخت با شناسه
   * @param paymentId شناسه پرداخت
   */
  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await axios.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * لغو پرداخت
   * @param paymentId شناسه پرداخت
   */
  cancelPayment: async (
    paymentId: string
  ): Promise<{ message: string; payment: Payment }> => {
    const response = await axios.post(`/payments/${paymentId}/cancel`);
    return response.data;
  },

  /**
   * دریافت همه پرداخت‌ها (ادمین)
   * @param filters فیلترهای جستجو
   */
  getAllPayments: async (
    filters?: PaymentFilters
  ): Promise<PaginatedPayments> => {
    const response = await axios.get("/payments", { params: filters });
    return response.data;
  },
};
