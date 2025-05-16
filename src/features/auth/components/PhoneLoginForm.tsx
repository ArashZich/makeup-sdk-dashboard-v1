// src/features/auth/components/PhoneLoginForm.tsx
"use client";

import { useState } from "react";
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

// اسکیمای اعتبارسنجی فرم
const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(10, "شماره تلفن باید حداقل ۱۰ رقم باشد")
    .max(11, "شماره تلفن نمی‌تواند بیشتر از ۱۱ رقم باشد")
    .regex(/^09\d{9}$|^9\d{9}$/, "فرمت شماره تلفن صحیح نیست"),
});

type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;

export function PhoneLoginForm() {
  const { t, isRtl } = useLanguage();
  const { sendOtp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhoneLoginFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: PhoneLoginFormValues) => {
    setIsLoading(true);
    try {
      // اطمینان حاصل کنیم که شماره تلفن با ۰۹ شروع می‌شود
      const phone = values.phone.startsWith("09")
        ? values.phone
        : `09${values.phone.replace(/^9/, "")}`;

      const result = await sendOtp({ phone });

      // هدایت به صفحه تأیید کد با ارسال اطلاعات مورد نیاز
      router.push(`/auth/verify-otp?phone=${phone}&userId=${result.userId}`);
    } catch (error) {
      console.error("خطا در ارسال کد تأیید:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full" // افزایش فاصله
        dir={isRtl ? "rtl" : "ltr"}
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">
                {t("auth.enterPhone")}
              </FormLabel>{" "}
              {/* افزایش اندازه متن */}
              <FormControl>
                <Input
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  {...field}
                  autoComplete="tel"
                  disabled={isLoading}
                  className={`${
                    isRtl ? "text-right" : "text-left"
                  } h-12 text-lg`} // افزایش اندازه فیلد و متن
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
          {" "}
          {/* افزایش اندازه دکمه و متن */}
          {isLoading ? (
            <Loader size="sm" variant="spinner" />
          ) : (
            t("auth.sendOtp")
          )}
        </Button>
      </form>
    </Form>
  );
}
