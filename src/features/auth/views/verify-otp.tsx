// src/features/auth/views/VerifyOtpView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/api/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpVerificationForm } from "../components/OtpVerificationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function VerifyOtpView() {
  const { t, isRtl } = useLanguage();
  const { user, isLoading, sendOtp } = useAuth();
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
      console.error("خطا در ارسال مجدد کد:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("auth.verifyOtp")}
        </h1>
      </div>

      <Card dir={isRtl ? "rtl" : "ltr"} className="px-2 sm:px-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-xl">
            {t("auth.enterOtp")}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <OtpVerificationForm phone={phone} onResendOtp={handleResendOtp} />
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/auth/login")}
          className="text-base"
        >
          {isRtl ? (
            <>
              {t("common.back")}
              <ArrowRight className="mr-2 h-4 w-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
