// src/features/auth/components/OtpVerificationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@/api/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/common/OtpInput";
import { Loader } from "@/components/common/Loader";
import {
  cleanOtpCode,
  validateOtpCode,
  convertEnglishToPersianNumbers,
} from "@/lib/numberConverter";
import { logger } from "@/lib/logger";

interface OtpVerificationFormProps {
  phone: string;
  onResendOtp: () => Promise<void>;
}

export function OtpVerificationForm({
  phone,
  onResendOtp,
}: OtpVerificationFormProps) {
  const { t, isRtl } = useLanguage();
  const { verifyOtp, isVerifyingOtp } = useAuthActions();
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [seconds, setSeconds] = useState(120);

  // شمارنده معکوس برای ارسال مجدد کد
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // پاک کردن خطا وقتی کاربر شروع به تایپ می‌کنه
  useEffect(() => {
    if (otpCode && otpError) {
      setOtpError(false);
      setErrorMessage("");
    }
  }, [otpCode, otpError]);

  const handleResendOtp = async () => {
    if (seconds > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResendOtp();
      setSeconds(120);
      setOtpCode(""); // پاک کردن کد قبلی
      setOtpError(false);
      setErrorMessage("");
    } finally {
      setIsResending(false);
    }
  };

  // تابع submit دستی - فقط وقتی کاربر دکمه بزنه
  const handleSubmit = async () => {
    if (isVerifyingOtp) return; // جلوگیری از کلیک چندباره

    // بررسی طول کد
    if (otpCode.length !== 5) {
      setOtpError(true);
      setErrorMessage("کد تأیید باید ۵ رقم باشد");
      return;
    }

    // اعتبارسنجی کد
    const cleanCode = cleanOtpCode(otpCode);

    if (!validateOtpCode(cleanCode, 5, 5)) {
      setOtpError(true);
      setErrorMessage(t("auth.error.invalidOtp"));
      return;
    }

    try {
      await verifyOtp({ phone, code: cleanCode });
      // navigation خودکار توسط context انجام می‌شه
    } catch (error: any) {
      logger.error("خطا در تأیید کد:", error);
      setOtpError(true);
      setErrorMessage(
        error?.response?.data?.message || t("auth.error.invalidOtp")
      );
      // پاک کردن کد برای امتحان مجدد
      setOtpCode("");
    }
  };

  // فعال بودن دکمه تأیید
  const isSubmitEnabled = otpCode.length === 5 && !isVerifyingOtp;

  return (
    <div className="space-y-8 w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* اطلاعات شماره تلفن */}
      <div className="text-center space-y-2">
        <p className="text-muted-foreground text-sm">{t("auth.enterOtp")}</p>
        <p className="text-foreground font-semibold text-lg">{phone}</p>
      </div>

      {/* کامپوننت OTP Input - ۵ خانه */}
      <div className="flex justify-center">
        <OtpInput
          length={5}
          value={otpCode}
          onChange={setOtpCode}
          disabled={isVerifyingOtp}
          error={otpError}
          size="lg"
          autoFocus={true}
          className="max-w-sm"
        />
      </div>

      {/* نمایش خطا */}
      {otpError && errorMessage && (
        <div className="text-center">
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        </div>
      )}

      {/* دکمه تأیید */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          size="lg"
          className="min-w-[200px] h-12 text-base font-semibold"
        >
          {isVerifyingOtp ? (
            <div className="flex items-center gap-2">
              <Loader size="sm" variant="spinner" />
              <span>در حال تأیید...</span>
            </div>
          ) : (
            t("auth.verifyOtp")
          )}
        </Button>
      </div>

      {/* بخش ارسال مجدد */}
      <div className="text-center pt-4 border-t border-border/50">
        {seconds > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("auth.remainingTimeToResend", {
              seconds: isRtl
                ? convertEnglishToPersianNumbers(seconds.toString())
                : seconds,
            })}
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-sm"
          >
            {isResending ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" variant="spinner" />
                <span>در حال ارسال...</span>
              </div>
            ) : (
              t("auth.resendOtp")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
