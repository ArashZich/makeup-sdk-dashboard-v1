// src/api/services/payments-service.ts
import axios from "@/lib/axios";
import {
  Payment,
  PaymentFilters,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaginatedPayments,
  PaymentStatus,
  PaymentsStatsRequest,
  PaymentsAllPlatformsStatsResponse,
  PaymentsPlatformSpecificStatsResponse,
  PaymentsPlatform,
  PaymentsTimeRange,
} from "@/api/types/payments.types";

export const paymentsService = {
  // ========== API های کاربر ==========

  /**
   * ایجاد درخواست پرداخت
   * @param data اطلاعات پرداخت (شامل planId و couponCode)
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
    status?: PaymentStatus
  ): Promise<PaginatedPayments> => {
    const params = status ? { status } : {};
    const response = await axios.get("/payments/me", { params });
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

  // ========== API های ادمین ==========

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

  // ========== آمار درآمد ==========

  /**
   * دریافت آمار درآمد کلی همه پلتفرم‌ها
   * @param params پارامترهای فیلتر (timeRange)
   */
  getAllPlatformsStats: async (
    params?: Omit<PaymentsStatsRequest, "platform">
  ): Promise<PaymentsAllPlatformsStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", { params });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم خاص
   * @param params پارامترهای فیلتر (شامل پلتفرم و timeRange)
   */
  getPlatformStats: async (
    params: PaymentsStatsRequest & { platform: PaymentsPlatform }
  ): Promise<PaymentsPlatformSpecificStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", { params });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم عادی
   * @param timeRange بازه زمانی
   */
  getNormalPlatformStats: async (
    timeRange?: PaymentsTimeRange
  ): Promise<PaymentsPlatformSpecificStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { platform: "normal", timeRange },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم دیوار
   * @param timeRange بازه زمانی
   */
  getDivarPlatformStats: async (
    timeRange?: PaymentsTimeRange
  ): Promise<PaymentsPlatformSpecificStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { platform: "divar", timeRange },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم ترب
   * @param timeRange بازه زمانی
   */
  getTorobPlatformStats: async (
    timeRange?: PaymentsTimeRange
  ): Promise<PaymentsPlatformSpecificStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { platform: "torob", timeRange },
    });
    return response.data;
  },

  /**
   * دریافت آمار درآمد پلتفرم باسلام
   * @param timeRange بازه زمانی
   */
  getBasalamPlatformStats: async (
    timeRange?: PaymentsTimeRange
  ): Promise<PaymentsPlatformSpecificStatsResponse> => {
    const response = await axios.get("/payments/stats/revenue", {
      params: { platform: "basalam", timeRange },
    });
    return response.data;
  },
};
