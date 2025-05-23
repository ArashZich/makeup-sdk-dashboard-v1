// src/api/types/upload.types.ts

// انواع تصویر مجاز
export type ImageType = "avatar" | "product" | "color" | "general";

// اطلاعات فایل آپلود شده
export interface UploadedFileInfo {
  url: string;
  filename: string;
  size: number;
}

// پاسخ موفق آپلود
export interface UploadSuccessResponse {
  success: true;
  message: string;
  data: {
    hash: string;
    originalName: string;
    originalSize: number;
    type: ImageType;
    urls: {
      original: UploadedFileInfo;
      thumbnail: UploadedFileInfo;
    };
    uploadedAt: string;
    processingTime: string;
    description?: string;
    tags?: string[];
  };
}

// پاسخ خطا آپلود
export interface UploadErrorResponse {
  success: false;
  code: number;
  message: string;
}

// تایپ کلی پاسخ آپلود
export type UploadResponse = UploadSuccessResponse | UploadErrorResponse;

// درخواست آپلود
export interface UploadRequest {
  image: File;
  type?: ImageType;
  description?: string;
  tags?: string[] | string; // می‌تونه آرایه یا string باشه
}

// پارامترهای FormData آپلود
export interface UploadFormData {
  image: File;
  type?: string;
  description?: string;
  tags?: string; // همیشه string چون JSON.stringify می‌شه
}

// تنظیمات آپلود
export interface UploadOptions {
  onProgress?: (progressEvent: any) => void; // AxiosProgressEvent
  signal?: AbortSignal; // برای cancel کردن آپلود
}

// محدودیت‌های آپلود
export interface UploadLimits {
  maxFileSize: number; // 2MB = 2 * 1024 * 1024
  maxFilesPerMinute: number; // 10 فایل در دقیقه
  allowedTypes: string[]; // ["image/jpeg", "image/png", "image/webp", "image/gif"]
}

// نوع خطاهای آپلود
export type UploadErrorType =
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "RATE_LIMIT_EXCEEDED"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "CANCELLED";

// جزئیات خطای آپلود
export interface UploadError {
  type: UploadErrorType;
  message: string;
  code?: number;
}
