// src/api/hooks/useAuth.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/api/services/auth-service";
import { useCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/lib/toast";
import {
  SendOtpRequest,
  VerifyOtpRequest,
  OAuthLoginRequest,
} from "@/api/types/auth.types";

/**
 * هوک برای استفاده از API احراز هویت
 */
export const useAuth = () => {
  const router = useRouter();
  const { setCookie, removeCookie } = useCookies();
  const { setAuth, clearAuth } = useAuthStore();
  const { t } = useLanguage();

  // استفاده از query برای دریافت اطلاعات کاربر جاری
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: false, // به صورت پیش‌فرض غیرفعال است
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

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
      // ذخیره توکن‌ها در کوکی
      setCookie("access_token", data.tokens.access.token, {
        expires: new Date(data.tokens.access.expires),
      });
      setCookie("refresh_token", data.tokens.refresh.token, {
        expires: new Date(data.tokens.refresh.expires),
      });
      setCookie("user_role", data.user.role, {
        expires: new Date(data.tokens.refresh.expires),
      });

      // ذخیره اطلاعات کاربر در store
      setAuth(data.user, data.tokens.access.token, data.tokens.refresh.token);

      showToast.success("auth.loginSuccess");
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
      // ذخیره توکن‌ها در کوکی
      setCookie("access_token", data.tokens.access.token, {
        expires: new Date(data.tokens.access.expires),
      });
      setCookie("refresh_token", data.tokens.refresh.token, {
        expires: new Date(data.tokens.refresh.expires),
      });
      setCookie("user_role", data.user.role, {
        expires: new Date(data.tokens.refresh.expires),
      });

      // ذخیره اطلاعات کاربر در store
      setAuth(data.user, data.tokens.access.token, data.tokens.refresh.token);

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
      // حذف توکن‌ها از کوکی
      removeCookie("access_token");
      removeCookie("refresh_token");
      removeCookie("user_role");

      // پاک کردن اطلاعات کاربر از store
      clearAuth();

      // هدایت به صفحه ورود
      router.push("/auth/login");
    },
  });

  // بررسی وضعیت فعلی احراز هویت
  const checkAuth = async () => {
    try {
      const result = await refetch();
      return result.data;
    } catch (error) {
      clearAuth();
      return null;
    }
  };

  return {
    user,
    isLoading,
    isError,
    sendOtp: sendOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    oauthLogin: oauthLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    checkAuth,
  };
};
