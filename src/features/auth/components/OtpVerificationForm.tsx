// src/features/auth/components/OtpVerificationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/api/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "@/components/common/Loader";
import { toFarsiNumber, toEnglishNumber } from "@/lib/utils";

// اسکیمای اعتبارسنجی فرم
const otpVerificationSchema = z.object({
  code: z
    .string()
    .min(4, "کد تأیید باید حداقل ۴ رقم باشد")
    .max(6, "کد تأیید نمی‌تواند بیشتر از ۶ رقم باشد")
    .regex(/^\d+$/, "کد تأیید باید فقط شامل اعداد باشد"),
  phone: z.string(),
});

type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

interface OtpVerificationFormProps {
  phone: string;
  onResendOtp: () => Promise<void>;
}

export function OtpVerificationForm({
  phone,
  onResendOtp,
}: OtpVerificationFormProps) {
  const { t, isRtl } = useLanguage();
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [seconds, setSeconds] = useState(120); // ۲ دقیقه برای ارسال مجدد

  const form = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      code: "",
      phone,
    },
  });

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

  const handleResendOtp = async () => {
    if (seconds > 0) return;

    setIsResending(true);
    try {
      await onResendOtp();
      setSeconds(120); // دوباره تنظیم شمارنده به ۲ دقیقه
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: OtpVerificationFormValues) => {
    setIsLoading(true);
    try {
      // تبدیل اعداد فارسی به انگلیسی
      const code = toEnglishNumber(values.code);

      await verifyOtp({ phone: values.phone, code });

      // هدایت به صفحه داشبورد پس از احراز هویت موفق
      router.push("/dashboard");
    } catch (error) {
      console.error("خطا در تأیید کد:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-base">
            {t("auth.enterOtp")}
            <br />
            <span className="text-foreground font-medium mt-3 inline-block text-lg">
              {phone}
            </span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">{t("auth.verifyOtp")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="۱۲۳۴"
                  {...field}
                  autoComplete="one-time-code"
                  disabled={isLoading}
                  className={`text-center text-xl tracking-widest h-12 ${
                    isRtl ? "font-iran" : "font-montserrat"
                  }`}
                  maxLength={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader size="sm" variant="spinner" />
          ) : (
            t("auth.verifyOtp")
          )}
        </Button>

        <div className="text-center mt-4">
          {seconds > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("auth.remainingTimeToResend", {
                seconds: isRtl ? toFarsiNumber(seconds.toString()) : seconds,
              })}
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-base"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? (
                <Loader size="sm" variant="spinner" />
              ) : (
                t("auth.resendOtp")
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
