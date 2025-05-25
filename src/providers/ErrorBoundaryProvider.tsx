// src/providers/ErrorBoundaryProvider.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryProvider extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // اینجا می‌توانید خطا را به سرویس گزارش خطا مانند Sentry ارسال کنید
    logger.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // اگر fallback ارائه شده باشد، آن را نمایش می‌دهیم، در غیر این صورت یک UI خطای پیش‌فرض نمایش می‌دهیم
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 p-4 text-center dark:bg-red-900/20">
          <h2 className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">
            خطایی رخ داده است
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            متأسفانه خطایی در برنامه رخ داده است. لطفاً صفحه را بارگذاری مجدد
            کنید.
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
          >
            بارگذاری مجدد صفحه
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
