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
      className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20 ${
        isRtl ? "font-iran" : "font-montserrat"
      } overflow-hidden`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-48 w-48 rounded-full flex items-center justify-center text-2xl font-bold">
            <Logo />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
