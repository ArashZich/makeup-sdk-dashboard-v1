// src/features/auth/components/PhoneLoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@/api/hooks/useAuth";
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
  cleanPhoneNumber,
  validateIranianPhoneNumber,
  convertPersianToEnglishNumbers,
} from "@/lib/numberConverter";
import { logger } from "@/lib/logger";

export function PhoneLoginForm() {
  const { t, isRtl } = useLanguage();
  const { sendOtp, isSendingOtp } = useAuthActions();
  const router = useRouter();

  // تعریف Schema با استفاده مستقیم از t()
  const phoneLoginSchema = z.object({
    phone: z
      .string()
      .min(1, t("auth.error.phoneRequired"))
      .transform((val) => cleanPhoneNumber(val))
      .refine((val) => validateIranianPhoneNumber(val), {
        message: t("auth.error.invalidPhone"),
      }),
  });

  type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;

  const form = useForm<PhoneLoginFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: PhoneLoginFormValues) => {
    try {
      const result = await sendOtp({ phone: values.phone });

      // هدایت به صفحه تأیید کد با ارسال اطلاعات مورد نیاز
      router.push(
        `/auth/verify-otp?phone=${values.phone}&userId=${result.userId}`
      );
    } catch (error) {
      logger.error("خطا در ارسال کد تأیید:", error);
      // خطاها توسط useAuthActions مدیریت می‌شوند
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {t("auth.enterPhone")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  {...field}
                  autoComplete="tel"
                  disabled={isSendingOtp}
                  className={`${
                    isRtl ? "text-right" : "text-left"
                  } h-10 text-base`}
                  onChange={(e) => {
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
          disabled={isSendingOtp}
        >
          {isSendingOtp ? (
            <Loader size="sm" variant="spinner" />
          ) : (
            t("auth.sendOtp")
          )}
        </Button>
      </form>
    </Form>
  );
}
