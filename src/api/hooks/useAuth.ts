// src/api/hooks/useAuth.ts - ساده شده
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/api/services/auth-service";
import { useCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth as useAuthContext } from "@/contexts/AuthContext"; // استفاده از context
import { showToast } from "@/lib/toast";
import {
  SendOtpRequest,
  VerifyOtpRequest,
  OAuthLoginRequest,
} from "@/api/types/auth.types";

/**
 * هوک برای actions احراز هویت (login/logout)
 */
export const useAuthActions = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setCookie, removeCookie } = useCookies();
  const { login: contextLogin, logout: contextLogout } = useAuthContext();
  const { t } = useLanguage();

  // استفاده از mutation برای ارسال درخواست OTP
  const sendOtpMutation = useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: (data) => {
      showToast.success(t("auth.otpSent"));
      return data;
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("auth.error.invalidPhone")
      );
      throw error;
    },
  });

  // استفاده از mutation برای تایید کد OTP
  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (data) => {
      // استفاده از context login
      contextLogin(
        data.tokens.access.token,
        data.tokens.refresh.token,
        data.user
      );
      showToast.success(t("auth.loginSuccess"));
      return data;
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("auth.error.invalidOtp")
      );
      throw error;
    },
  });

  // استفاده از mutation برای ورود با OAuth
  const oauthLoginMutation = useMutation({
    mutationFn: (data: OAuthLoginRequest) => authService.oauthLogin(data),
    onSuccess: (data) => {
      // استفاده از context login
      contextLogin(
        data.tokens.access.token,
        data.tokens.refresh.token,
        data.user
      );
      showToast.success(t("auth.loginSuccess"));
      return data;
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("auth.error.invalidCredentials")
      );
      throw error;
    },
  });

  // استفاده از mutation برای خروج از سیستم
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // استفاده از context logout
      contextLogout();
      showToast.success(t("auth.logoutSuccess"));
    },
    onError: (error: any) => {
      // حتی اگر logout از سرور با خطا مواجه شد، کاربر رو logout کن
      contextLogout();
    },
  });

  return {
    sendOtp: sendOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    oauthLogin: oauthLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    // loading states
    isSendingOtp: sendOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
