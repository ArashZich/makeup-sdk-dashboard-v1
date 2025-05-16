// src/types/theme.types.ts
import { type ClassValue } from "clsx";

// تایپ متا‌دیتای تم
export interface ThemeMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
}

// تایپ گزینه‌های تم
export interface ThemeOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}

// اینترفیس کامپوننت با پشتیبانی از className و RTL
export interface WithClassNameAndRTL {
  className?: ClassValue;
  rtl?: boolean;
}

// اینترفیس برای کامپوننت‌های با وضعیت لودینگ
export interface WithLoading {
  isLoading?: boolean;
  loadingText?: string;
}

// اینترفیس برای کامپوننت‌های با وضعیت خطا
export interface WithError {
  error?: string | null;
  onErrorDismiss?: () => void;
}
