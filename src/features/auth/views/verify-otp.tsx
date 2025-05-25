// src/features/auth/views/verify-otp.tsx - آپدیت شده
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // تغییر
import { useAuthActions } from "@/api/hooks/useAuth"; // تغییر
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpVerificationForm } from "../components/OtpVerificationForm";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { BackButton } from "@/components/common/BackButton";

export default function VerifyOtpView() {
  const { t, isRtl } = useLanguage();
  const { user, isLoading } = useAuth(); // از context
  const { sendOtp } = useAuthActions(); // از actions
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone") || "";
  const userId = searchParams.get("userId") || "";

  const [isResending, setIsResending] = useState(false);

  // اگر شماره تلفن یا شناسه کاربر موجود نباشد، به صفحه ورود هدایت می‌شود
  useEffect(() => {
    if (!phone || !userId) {
      router.push("/auth/login");
    }
  }, [phone, userId, router]);

  // اگر کاربر قبلاً احراز هویت شده باشد، به داشبورد هدایت می‌شود
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await sendOtp({ phone });
      showToast.success(t("auth.otpResent"));
    } catch (error) {
      logger.error("خطا در ارسال مجدد کد:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Card dir={isRtl ? "rtl" : "ltr"} className="border-border/50 shadow-lg">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-lg font-bold">
            {t("auth.verifyOtp")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t("auth.enterOtp")}
          </p>
        </CardHeader>
        <CardContent className="py-4">
          <OtpVerificationForm phone={phone} onResendOtp={handleResendOtp} />
        </CardContent>
      </Card>

      <div className="text-center">
        <BackButton label={t("common.back")} href="/auth/login" />
      </div>
    </div>
  );
}
