// src/features/divar/views/DivarRedirectView.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCookies } from "@/lib/cookies";
import { useAuthStore } from "@/store/auth.store";
import { Loader } from "@/components/common/Loader";
import { useLanguage } from "@/contexts/LanguageContext";
import { showToast } from "@/lib/toast";
import { User } from "@/api/types/auth.types";

export function DivarRedirectView() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCookie } = useCookies();
  const { setAuth } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false); // Flag to prevent multiple processing

  // Use useCallback to prevent the function from being recreated on each render
  const processParams = useCallback(async () => {
    // Skip if already processed
    if (processed) return;
    setProcessed(true);

    try {
      // دریافت پارامترها از URL
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const userId = searchParams.get("user_id");
      const phone = searchParams.get("phone");
      const authSuccess = searchParams.get("auth_success");
      const hasActivePackage = searchParams.get("has_active_package");

      // بررسی اعتبار پارامترها
      if (
        !accessToken ||
        !refreshToken ||
        !userId ||
        !phone ||
        authSuccess !== "true"
      ) {
        setError(t("divar.error.authFailed"));
        setIsProcessing(false);
        return;
      }

      // به جای درخواست به API، یک آبجکت کاربر با اطلاعات موجود می‌سازیم
      const user: User = {
        _id: userId,
        phone: phone,
        name: phone, // می‌تونیم در ابتدا از شماره تلفن به عنوان نام استفاده کنیم
        role: "user",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ذخیره توکن‌ها در کوکی
      // ایجاد تاریخ انقضا برای توکن‌ها - مثلاً 7 روز برای refresh token
      const refreshExpires = new Date();
      refreshExpires.setDate(refreshExpires.getDate() + 7);

      // و 1 روز برای access token
      const accessExpires = new Date();
      accessExpires.setDate(accessExpires.getDate() + 1);

      setCookie("access_token", accessToken, {
        expires: accessExpires,
        path: "/",
      });

      setCookie("refresh_token", refreshToken, {
        expires: refreshExpires,
        path: "/",
      });

      setCookie("user_role", user.role, {
        expires: refreshExpires,
        path: "/",
      });

      // ذخیره اطلاعات کاربر در استور
      setAuth(user, accessToken, refreshToken);

      // نمایش پیام موفقیت
      showToast.success(t("divar.loginSuccess"));

      // هدایت به صفحه داشبورد بعد از 2 ثانیه
      setTimeout(() => {
        const redirectPath =
          hasActivePackage === "true"
            ? "/dashboard/divar" // اگر بسته فعال داره، مستقیم به صفحه دیوار بره
            : "/dashboard"; // در غیر این صورت به داشبورد اصلی

        router.push(redirectPath);
      }, 2000);
    } catch (err) {
      console.error("Error in Divar redirect page:", err);
      setError(t("divar.error.general"));
    } finally {
      setIsProcessing(false);
    }
  }, [searchParams, setCookie, setAuth, router, t, processed]);

  // Call processParams once when the component mounts
  useEffect(() => {
    processParams();
  }, [processParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isProcessing
            ? t("divar.connecting")
            : error
            ? t("common.error.title")
            : t("divar.connected")}
        </h1>

        {isProcessing ? (
          <>
            <Loader size="lg" text="" className="my-6" />
            <p className="text-muted-foreground">
              {t("divar.redirectingMessage")}
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-destructive my-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => router.push("/auth/login")}
            >
              {t("auth.login")}
            </button>
          </>
        ) : (
          <>
            <div className="text-green-500 my-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              {t("divar.redirectingToDashboard")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
