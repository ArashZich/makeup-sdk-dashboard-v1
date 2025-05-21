// src/features/divar/views/DivarRedirectView.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCookies } from "@/lib/cookies";
// import { useAuthStore } from "@/store/auth.store"; // دیگر نیازی به این نیست، از AuthContext استفاده می‌کنیم
import { Loader } from "@/components/common/Loader";
import { useLanguage } from "@/contexts/LanguageContext";
import { showToast } from "@/lib/toast";
import { User, DivarTokens } from "@/api/types/auth.types"; // DivarTokens اضافه شد
import { useAuth } from "@/contexts/AuthContext"; // استفاده از AuthContext

export function DivarRedirectView() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCookie } = useCookies();
  const { login: contextLogin, updateUser, user: currentUser } = useAuth(); // updateUser و currentUser اضافه شد
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  const processParams = useCallback(async () => {
    if (processed) return;
    setProcessed(true);

    try {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const userId = searchParams.get("user_id");
      const phone = searchParams.get("phone");
      const authSuccess = searchParams.get("auth_success");
      const hasActivePackage = searchParams.get("has_active_package");
      const divarAccessToken = searchParams.get("divar_access_token"); // توکن دسترسی دیوار
      const divarRefreshToken = searchParams.get("divar_refresh_token"); // توکن رفرش دیوار
      const divarExpiresAt = searchParams.get("divar_expires_at"); // تاریخ انقضای توکن دیوار

      if (
        !accessToken ||
        !refreshToken ||
        !userId ||
        !phone ||
        authSuccess !== "true" ||
        !divarAccessToken || // بررسی وجود توکن‌های دیوار
        !divarRefreshToken ||
        !divarExpiresAt
      ) {
        setError(t("divar.error.authFailed"));
        setIsProcessing(false);
        return;
      }

      const userFromParams: User = {
        _id: userId,
        phone: phone,
        name: phone,
        role: "user",
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        divarTokens: {
          // ذخیره توکن‌های دیوار
          accessToken: divarAccessToken,
          refreshToken: divarRefreshToken,
          expiresAt: divarExpiresAt,
        },
      };

      // اگر کاربر هنوز لاگین نکرده (currentUser وجود ندارد)، با اطلاعات جدید لاگین می‌کنیم
      if (!currentUser) {
        contextLogin(accessToken, refreshToken, userFromParams);
      } else {
        // اگر کاربر لاگین کرده، فقط اطلاعات divarTokens را به‌روزرسانی می‌کنیم
        updateUser({
          divarTokens: {
            accessToken: divarAccessToken,
            refreshToken: divarRefreshToken,
            expiresAt: divarExpiresAt,
          },
        });
        // ممکن است نیاز به ذخیره مجدد توکن‌های اصلی برنامه هم باشد اگر API دیوار آنها را برمی‌گرداند
        // در اینجا فرض بر این است که توکن‌های اصلی برنامه تغییر نمی‌کنند
      }

      const refreshExpires = new Date();
      refreshExpires.setDate(refreshExpires.getDate() + 7);

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

      setCookie("user_role", userFromParams.role, {
        expires: refreshExpires,
        path: "/",
      });

      // ذخیره توکن‌های دیوار در کوکی‌ها (اختیاری، بستگی به نحوه استفاده شما دارد)
      // setCookie("divar_access_token", divarAccessToken, { expires: new Date(divarExpiresAt), path: "/" });
      // setCookie("divar_refresh_token", divarRefreshToken, { expires: refreshExpires, path: "/" });

      showToast.success(t("divar.loginSuccess"));

      setTimeout(() => {
        const redirectPath =
          hasActivePackage === "true" ? "/dashboard/divar" : "/dashboard";

        router.push(redirectPath);
      }, 2000);
    } catch (err) {
      console.error("Error in Divar redirect page:", err);
      setError(t("divar.error.general"));
    } finally {
      setIsProcessing(false);
    }
  }, [
    processed,
    searchParams,
    setCookie,
    contextLogin, // تغییر نام برای جلوگیری از تداخل
    updateUser, // اضافه شد
    currentUser, // اضافه شد
    router,
    t,
  ]);

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
