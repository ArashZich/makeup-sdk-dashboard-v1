// src/layouts/AuthLayout.tsx
"use client";

import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t, isRtl } = useLanguage();

  return (
    <div
      className={`min-h-screen h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20 ${
        isRtl ? "font-iran" : "font-montserrat"
      } overflow-hidden`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* دکمه‌های تغییر زبان و تم */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* محتوای اصلی */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-1">
        {/* محتوای فرم */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
