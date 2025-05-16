// src/api/services/coupons-service.ts
import axios from "@/lib/axios";
import {
  Coupon,
  CouponFilters,
  ValidateCouponRequest,
  ValidateCouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
  PaginatedCoupons,
} from "@/api/types/coupons.types";

export const couponsService = {
  /**
   * بررسی اعتبار کوپن
   * @param data اطلاعات اعتبارسنجی کوپن
   */
  validateCoupon: async (
    data: ValidateCouponRequest
  ): Promise<ValidateCouponResponse> => {
    const response = await axios.post("/coupons/validate", data);
    return response.data;
  },

  /**
   * دریافت همه کوپن‌ها (ادمین)
   * @param filters فیلترهای جستجو
   */
  getAllCoupons: async (filters?: CouponFilters): Promise<PaginatedCoupons> => {
    const response = await axios.get("/coupons", { params: filters });
    return response.data;
  },

  /**
   * دریافت کوپن با شناسه (ادمین)
   * @param couponId شناسه کوپن
   */
  getCouponById: async (couponId: string): Promise<Coupon> => {
    const response = await axios.get(`/coupons/${couponId}`);
    return response.data;
  },

  /**
   * ایجاد کوپن جدید (ادمین)
   * @param data اطلاعات کوپن جدید
   */
  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await axios.post("/coupons", data);
    return response.data;
  },

  /**
   * به‌روزرسانی کوپن (ادمین)
   * @param couponId شناسه کوپن
   * @param data اطلاعات جدید کوپن
   */
  updateCoupon: async (
    couponId: string,
    data: UpdateCouponRequest
  ): Promise<Coupon> => {
    const response = await axios.put(`/coupons/${couponId}`, data);
    return response.data;
  },

  /**
   * غیرفعال‌سازی کوپن (ادمین)
   * @param couponId شناسه کوپن
   */
  deactivateCoupon: async (couponId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/coupons/${couponId}`);
    return response.data;
  },
};
