// src/api/types/error.types.ts
// تایپ‌های کلی برای مدیریت خطاها در کل پروژه

// تایپ خطای استاندارد API
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      details?: string;
      code?: number;
      errors?: Record<string, string[]>;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
  name?: string;
}

// تایپ خطای ساده برای مواردی که فقط پیام نیاز داریم
export interface SimpleError {
  message?: string;
}

// تایپ خطای شبکه
export interface NetworkError extends ApiError {
  request?: unknown;
}

// تایپ خطای validation
export interface ValidationError extends ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

// تایپ خطای احراز هویت
export interface AuthError extends ApiError {
  response?: {
    data?: {
      message?: string;
      code?: number;
      authCode?: "INVALID_TOKEN" | "TOKEN_EXPIRED" | "INVALID_CREDENTIALS";
    };
    status?: 401 | 403;
  };
}

// تایپ کلی برای تمام خطاهای ممکن
export type GeneralError = ApiError | SimpleError | NetworkError | Error;

// Helper type guards
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as ApiError).response === "object"
  );
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return (
    isApiError(error) &&
    Boolean(error.response?.data?.errors) &&
    typeof error.response?.data?.errors === "object"
  );
};

export const isAuthError = (error: unknown): error is AuthError => {
  return (
    isApiError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
};

// Helper function برای استخراج پیام خطا
export const getErrorMessage = (
  error: unknown,
  fallbackMessage = "خطای نامشخص رخ داده است"
): string => {
  if (isApiError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallbackMessage;
};
