// src/api/services/auth-service.ts
import axios from "@/lib/axios";
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  OAuthLoginRequest,
} from "@/api/types/auth.types";

export const authService = {
  /**
   * ارسال درخواست برای OTP
   * @param data درخواست ارسال OTP شامل شماره تلفن
   */
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await axios.post("/auth/login/otp", data);
    return response.data;
  },

  /**
   * تایید کد OTP
   * @param data درخواست تایید OTP شامل شماره تلفن و کد
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    const response = await axios.post("/auth/verify-otp", data);
    return response.data;
  },

  /**
   * نوسازی توکن دسترسی با استفاده از توکن بازیابی
   * @param data درخواست نوسازی توکن شامل توکن بازیابی
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await axios.post("/auth/refresh-token", data);
    return response.data;
  },

  /**
   * خروج از سیستم و غیرفعال سازی توکن بازیابی
   */
  logout: async (): Promise<void> => {
    await axios.post("/auth/logout");
  },

  /**
   * ورود با OAuth (مانند دیوار)
   * @param data درخواست ورود با OAuth
   */
  oauthLogin: async (data: OAuthLoginRequest): Promise<LoginResponse> => {
    const response = await axios.post("/auth/oauth", data);
    return response.data;
  },

  /**
   * بررسی وضعیت فعلی احراز هویت (دریافت اطلاعات کاربر جاری)
   */
  getCurrentUser: async () => {
    const response = await axios.get("/users/me");
    return response.data;
  },
};
