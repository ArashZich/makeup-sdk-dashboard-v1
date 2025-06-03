// src/features/auth/components/OtpVerificationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@/api/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/common/OtpInput";
import { Loader } from "@/components/common/Loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
  const [isResending, setIsResending] = useState(false);
  const [seconds, setSeconds] = useState(120);

  // تعریف Schema با استفاده مستقیم از t()
  const otpVerificationSchema = z.object({
    otp: z
      .string()
      .min(1, t("auth.error.otpRequired"))
      .transform((val) => cleanOtpCode(val))
      .refine((val) => validateOtpCode(val, 5, 5), {
        message: t("auth.error.invalidOtp"),
      }),
  });

  type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

  const form = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const watchedOtp = form.watch("otp");

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
    if (watchedOtp && form.formState.errors.otp) {
      form.clearErrors("otp");
    }
  }, [watchedOtp, form]);

  const handleResendOtp = async () => {
    if (seconds > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResendOtp();
      setSeconds(120);
      form.setValue("otp", ""); // پاک کردن کد قبلی
      form.clearErrors();
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: OtpVerificationFormValues) => {
    try {
      await verifyOtp({ phone, code: values.otp });
      // navigation خودکار توسط context انجام می‌شه
    } catch (error: any) {
      logger.error("خطا در تأیید کد:", error);
      form.setError("otp", {
        type: "manual",
        message: error?.response?.data?.message || t("auth.error.invalidOtp"),
      });
      // پاک کردن کد برای امتحان مجدد
      form.setValue("otp", "");
    }
  };

  // تابع برای مدیریت Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && watchedOtp.length === 5 && !isVerifyingOtp) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  // فعال بودن دکمه تأیید
  const isSubmitEnabled = watchedOtp.length === 5 && !isVerifyingOtp;

  return (
    <div className="space-y-8 w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* اطلاعات شماره تلفن */}
      <div className="text-center space-y-2">
        <p className="text-foreground font-semibold text-lg">{phone}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          onKeyDown={handleKeyDown}
        >
          {/* کامپوننت OTP Input */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center">
                    <OtpInput
                      length={5}
                      value={field.value}
                      onChange={field.onChange}
                      onKeyDown={handleKeyDown}
                      disabled={isVerifyingOtp}
                      error={!!form.formState.errors.otp}
                      size="lg"
                      autoFocus={true}
                      className="max-w-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          {/* دکمه تأیید */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!isSubmitEnabled}
              size="lg"
              className="min-w-[200px] h-12 text-base font-semibold"
            >
              {isVerifyingOtp ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" variant="spinner" />
                  <span>{t("auth.verifying")}</span>
                </div>
              ) : (
                t("auth.verifyOtp")
              )}
            </Button>
          </div>
        </form>
      </Form>

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
                <span>{t("auth.sending")}</span>
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
