// src/api/hooks/useAuth.ts - ساده شده
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/services/auth-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth as useAuthContext } from "@/contexts/AuthContext"; // استفاده از context
import { showToast } from "@/lib/toast";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  SendOtpRequest,
  VerifyOtpRequest,
  OAuthLoginRequest,
} from "@/api/types/auth.types";

/**
 * هوک برای actions احراز هویت (login/logout)
 */
export const useAuthActions = () => {
  const { login: contextLogin, logout: contextLogout } = useAuthContext();
  const { t } = useLanguage();

  // استفاده از mutation برای ارسال درخواست OTP
  const sendOtpMutation = useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: () => {
      showToast.success(t("auth.otpSent"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("auth.error.invalidPhone")));
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
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("auth.error.invalidOtp")));
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
    },
    onError: (error: ApiError) => {
      showToast.error(
        getErrorMessage(error, t("auth.error.invalidCredentials"))
      );
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
    onError: () => {
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
