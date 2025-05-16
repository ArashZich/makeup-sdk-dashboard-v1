// src/layouts/DashboardLayout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useUIStore } from "@/store/ui.store";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isRtl } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  // بستن سایدبار در حالت موبایل هنگام تغییر مسیر
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  // باز کردن سایدبار به صورت پیش‌فرض در دسکتاپ
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile, setSidebarOpen]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-background ${
        isRtl ? "font-iran" : "font-montserrat"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
