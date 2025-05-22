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
import {
  cleanPhoneNumber,
  validateIranianPhoneNumber,
  convertPersianToEnglishNumbers,
} from "@/lib/numberConverter";

// اسکیمای اعتبارسنجی فرم
const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(1, "شماره تلفن الزامی است")
    .transform((val) => cleanPhoneNumber(val))
    .refine((val) => validateIranianPhoneNumber(val), {
      message: "فرمت شماره تلفن صحیح نیست. مثال: 09123456789",
    }),
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
      // شماره تلفن از طریق schema پاک شده و اعتبارسنجی شده است
      const result = await sendOtp({ phone: values.phone });

      // هدایت به صفحه تأیید کد با ارسال اطلاعات مورد نیاز
      router.push(
        `/auth/verify-otp?phone=${values.phone}&userId=${result.userId}`
      );
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
                  disabled={isLoading}
                  className={`${
                    isRtl ? "text-right" : "text-left"
                  } h-10 text-base`}
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
            t("auth.sendOtp")
          )}
        </Button>
      </form>
    </Form>
  );
}
