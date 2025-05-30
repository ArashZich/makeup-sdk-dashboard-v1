// src/api/services/upload-service.ts
import uploadAxios from "@/lib/upload-axios";
import {
  UploadRequest,
  UploadResponse,
  UploadOptions,
  UploadLimits,
  UploadError,
  UploadErrorType,
} from "@/api/types/upload.types";

// محدودیت‌های آپلود
export const UPLOAD_LIMITS: UploadLimits = {
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxFilesPerMinute: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export const uploadService = {
  /**
   * محدودیت‌های آپلود
   */
  UPLOAD_LIMITS,

  /**
   * آپلود تصویر
   * @param data اطلاعات فایل و متادیتا
   * @param options تنظیمات آپلود (progress, cancel)
   */
  uploadImage: async (
    data: UploadRequest,
    options?: UploadOptions
  ): Promise<UploadResponse> => {
    try {
      // اعتبارسنجی فایل
      uploadService.validateFile(data.image);

      // ایجاد FormData
      const formData = new FormData();
      formData.append("image", data.image);

      if (data.type) {
        formData.append("type", data.type);
      }

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.tags) {
        // تبدیل tags به string (JSON)
        const tagsString = Array.isArray(data.tags)
          ? JSON.stringify(data.tags)
          : data.tags;
        formData.append("tags", tagsString);
      }

      // ارسال درخواست
      const response = await uploadAxios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: options?.onProgress,
        signal: options?.signal,
      });

      return response.data;
    } catch (error: unknown) {
      // مدیریت خطاها
      const uploadError = uploadService.handleUploadError(error);
      throw uploadError;
    }
  },

  /**
   * اعتبارسنجی فایل قبل از آپلود
   * @param file فایل مورد بررسی
   */
  validateFile: (file: File): void => {
    // بررسی سایز فایل
    if (file.size > UPLOAD_LIMITS.maxFileSize) {
      const maxSizeMB = (UPLOAD_LIMITS.maxFileSize / (1024 * 1024)).toFixed(2);
      throw {
        type: "FILE_TOO_LARGE",
        message: `سایز فایل زیاد است. حداکثر: ${maxSizeMB} MB`,
        code: 400,
      } as UploadError;
    }

    // بررسی نوع فایل
    if (!UPLOAD_LIMITS.allowedTypes.includes(file.type)) {
      throw {
        type: "INVALID_FILE_TYPE",
        message: `نوع فایل مجاز نیست. انواع مجاز: ${UPLOAD_LIMITS.allowedTypes.join(
          ", "
        )}`,
        code: 400,
      } as UploadError;
    }
  },

  /**
   * مدیریت خطاهای آپلود
   * @param error خطای دریافت شده
   */
  handleUploadError: (error: unknown): UploadError => {
    // اگر درخواست cancel شده
    if (
      (error instanceof Error && error.name === "CanceledError") ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "ERR_CANCELED")
    ) {
      return {
        type: "CANCELLED",
        message: "آپلود لغو شد",
        code: 0,
      };
    }

    // اگر پاسخ از سرور دریافت شده
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response: unknown }).response === "object" &&
      (error as { response: { data?: unknown } }).response.data
    ) {
      const serverError = (
        error as {
          response: {
            data: {
              message?: string;
              code?: number;
            };
          };
        }
      ).response.data;

      // تشخیص نوع خطا بر اساس پیام سرور
      if (
        serverError.message &&
        serverError.message.includes("سایز فایل زیاد")
      ) {
        return {
          type: "FILE_TOO_LARGE",
          message: serverError.message,
          code: serverError.code || 400,
        };
      }

      if (
        serverError.message &&
        serverError.message.includes("نوع فایل مجاز نیست")
      ) {
        return {
          type: "INVALID_FILE_TYPE",
          message: serverError.message,
          code: serverError.code || 400,
        };
      }

      if (serverError.message && serverError.message.includes("تعداد آپلود")) {
        return {
          type: "RATE_LIMIT_EXCEEDED",
          message: serverError.message,
          code: serverError.code || 429,
        };
      }

      return {
        type: "SERVER_ERROR",
        message: serverError.message || "خطای سرور",
        code: serverError.code || 500,
      };
    }

    // خطای شبکه
    if (typeof error === "object" && error !== null && "request" in error) {
      return {
        type: "NETWORK_ERROR",
        message: "خطا در ارتباط با سرور. اتصال اینترنت خود را بررسی کنید.",
        code: 0,
      };
    }

    // سایر خطاها
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "خطای نامشخص در آپلود";

    return {
      type: "SERVER_ERROR",
      message,
      code: 500,
    };
  },

  /**
   * لغو آپلود
   * @param controller AbortController برای لغو درخواست
   */
  cancelUpload: (controller: AbortController): void => {
    controller.abort();
  },

  /**
   * محاسبه درصد پیشرفت آپلود
   * @param progressEvent رویداد پیشرفت
   */
  calculateProgress: (progressEvent: {
    loaded?: number;
    total?: number;
    lengthComputable?: boolean;
  }): number => {
    if (
      progressEvent.lengthComputable ||
      (progressEvent.loaded && progressEvent.total)
    ) {
      const loaded = progressEvent.loaded || 0;
      const total = progressEvent.total || 0;
      if (total > 0) {
        return Math.round((loaded / total) * 100);
      }
    }
    return 0;
  },

  /**
   * تبدیل سایز فایل به فرمت قابل خواندن
   * @param bytes سایز به بایت
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};
