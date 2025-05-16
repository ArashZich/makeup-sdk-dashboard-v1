// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { iranSans, montserrat } from "@/lib/fonts";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundaryProvider } from "@/providers/ErrorBoundaryProvider";

export const metadata: Metadata = {
  title: "داشبورد SDK آرایش مجازی",
  description: "داشبورد مدیریت SDK آرایش مجازی",
  applicationName: "Makeup SDK Dashboard",
  authors: [{ name: "Makeup SDK Team" }],
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${iranSans.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-iran antialiased">
        <ErrorBoundaryProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <LanguageProvider>
                <AuthProvider>
                  <ToastProvider>{children}</ToastProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundaryProvider>
      </body>
    </html>
  );
}
