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
import {
  cleanOtpCode,
  validateOtpCode,
  convertPersianToEnglishNumbers,
  convertEnglishToPersianNumbers,
} from "@/lib/numberConverter";

// اسکیمای اعتبارسنجی فرم
const otpVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "کد تأیید الزامی است")
    .transform((val) => cleanOtpCode(val))
    .refine((val) => validateOtpCode(val, 4, 6), {
      message: "کد تأیید باید بین ۴ تا ۶ رقم باشد",
    }),
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
      // کد از طریق schema پاک شده و اعتبارسنجی شده است
      await verifyOtp({ phone: values.phone, code: values.code });

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
        className="space-y-4 w-full"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="text-center mb-4">
          <p className="text-muted-foreground text-sm">
            {t("auth.enterOtp")}
            <br />
            <span className="text-foreground font-medium mt-2 inline-block text-base">
              {phone}
            </span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {t("auth.verifyOtp")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="12345"
                  {...field}
                  autoComplete="one-time-code"
                  disabled={isLoading}
                  className={`text-center text-lg tracking-widest h-12 ${
                    isRtl ? "font-iran" : "font-montserrat"
                  }`}
                  maxLength={6}
                  onChange={(e) => {
                    // تبدیل اعداد فارسی به انگلیسی در هنگام تایپ
                    const convertedValue = convertPersianToEnglishNumbers(
                      e.target.value
                    );
                    field.onChange(convertedValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-10 text-sm"
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
                seconds: isRtl
                  ? convertEnglishToPersianNumbers(seconds.toString())
                  : seconds,
              })}
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-sm"
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
