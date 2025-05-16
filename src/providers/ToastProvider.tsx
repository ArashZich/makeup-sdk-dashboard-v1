"use client";

import React from "react";
import { Toaster, ToasterProps } from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ToastProviderProps extends Partial<Omit<ToasterProps, "children">> {
  children?: React.ReactNode;
}

export function ToastProvider({
  children,
  position = "bottom-center",
  toastOptions,
  ...props
}: ToastProviderProps) {
  const { direction } = useLanguage();

  const toastPosition =
    position || (direction === "rtl" ? "bottom-center" : "bottom-center");

  return (
    <>
      <Toaster
        position={toastPosition}
        toastOptions={{
          className: `${direction === "rtl" ? "font-iran" : "font-montserrat"}`,
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
          ...toastOptions,
        }}
        {...props}
      />
      {children}
    </>
  );
}
