// src/features/auth/views/LoginView.tsx
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
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("dashboard.welcome")}
        </p>
      </div>

      <Card dir={isRtl ? "rtl" : "ltr"} className="px-2 sm:px-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-xl">
            {t("auth.login")}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <PhoneLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
