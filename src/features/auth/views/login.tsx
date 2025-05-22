// src/features/auth/views/login.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/api/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneLoginForm } from "../components/PhoneLoginForm";

export default function LoginView() {
  const { t, isRtl } = useLanguage();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // اگر کاربر قبلاً احراز هویت شده باشد، به داشبورد هدایت می‌شود
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

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
    <div className="w-full">
      <Card dir={isRtl ? "rtl" : "ltr"} className="border-border/50 shadow-lg">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-lg font-bold">
            {t("dashboard.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t("auth.login")}
          </p>
        </CardHeader>
        <CardContent className="py-4">
          <PhoneLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
