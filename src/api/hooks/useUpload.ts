// src/api/hooks/useUpload.ts
import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadService } from "@/api/services/upload-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  UploadRequest,
  UploadResponse,
  UploadSuccessResponse,
  UploadError,
  ImageType,
} from "@/api/types/upload.types";

// وضعیت آپلود
interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadedFile: UploadSuccessResponse["data"] | null;
  error: UploadError | null;
}

/**
 * هوک برای آپلود تصویر
 */
export const useUpload = () => {
  const { t } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);

  // وضعیت آپلود
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedFile: null,
    error: null,
  });

  // Mutation برای آپلود
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadRequest): Promise<UploadResponse> => {
      // ایجاد AbortController جدید
      abortControllerRef.current = new AbortController();

      // تنظیم وضعیت شروع آپلود
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      try {
        const result = await uploadService.uploadImage(data, {
          signal: abortControllerRef.current.signal,
          onProgress: (progressEvent) => {
            const progress = uploadService.calculateProgress(progressEvent);
            setUploadState((prev) => ({ ...prev, progress }));
          },
        });

        return result;
      } catch (error) {
        // اگر لغو نشده، خطا را throw کن
        if (error instanceof Error && error.name !== "CanceledError") {
          throw error;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFile: data.data,
          error: null,
        }));

        showToast.success(t("upload.success"));
      }
    },
    onError: (error: UploadError) => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
        uploadedFile: null,
        error,
      }));

      // نمایش خطا فقط اگر لغو نشده باشد
      if (error.type !== "CANCELLED") {
        showToast.error(error.message || t("upload.error"));
      }
    },
  });

  /**
   * آپلود فایل
   * @param file فایل تصویر
   * @param type نوع تصویر
   * @param description توضیحات (اختیاری)
   * @param tags برچسب‌ها (اختیاری)
   */
  const uploadFile = useCallback(
    async (
      file: File,
      type?: ImageType,
      description?: string,
      tags?: string[]
    ) => {
      const uploadData: UploadRequest = {
        image: file,
        type,
        description,
        tags,
      };

      return uploadMutation.mutateAsync(uploadData);
    },
    [uploadMutation]
  );

  /**
   * لغو آپلود
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      uploadService.cancelUpload(abortControllerRef.current);
      abortControllerRef.current = null;
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      progress: 0,
      error: {
        type: "CANCELLED",
        message: t("upload.cancelled"),
        code: 0,
      },
    }));
  }, [t]);

  /**
   * ریست کردن وضعیت آپلود
   */
  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedFile: null,
      error: null,
    });
  }, []);

  /**
   * اعتبارسنجی فایل قبل از آپلود
   * @param file فایل مورد بررسی
   */
  const validateFile = useCallback((file: File): boolean => {
    try {
      uploadService.validateFile(file);
      return true;
    } catch (error) {
      const uploadError = error as UploadError;
      setUploadState((prev) => ({
        ...prev,
        error: uploadError,
      }));
      showToast.error(uploadError.message);
      return false;
    }
  }, []);

  /**
   * Helper function برای دریافت URL تصویر آپلود شده
   * @param size اندازه مورد نظر ('original' یا 'thumbnail')
   */
  const getUploadedImageUrl = useCallback(
    (size: "original" | "thumbnail" = "original"): string | null => {
      return uploadState.uploadedFile?.urls[size]?.url || null;
    },
    [uploadState.uploadedFile]
  );

  /**
   * Helper function برای دریافت اطلاعات فایل آپلود شده
   */
  const getUploadedFileInfo = useCallback(() => {
    return uploadState.uploadedFile;
  }, [uploadState.uploadedFile]);

  // Helper functions برای UI
  const isUploading = uploadState.isUploading;
  const progress = uploadState.progress;
  const hasError = uploadState.error !== null;
  const hasUploadedFile = uploadState.uploadedFile !== null;
  const canCancel = isUploading && progress < 100;

  return {
    // وضعیت
    uploadState,
    isUploading,
    progress,
    hasError,
    hasUploadedFile,
    canCancel,
    error: uploadState.error,
    uploadedFile: uploadState.uploadedFile,

    // توابع اصلی
    uploadFile,
    cancelUpload,
    resetUpload,
    validateFile,

    // Helper functions
    getUploadedImageUrl,
    getUploadedFileInfo,

    // Utility functions
    formatFileSize: uploadService.formatFileSize,
    uploadLimits: uploadService.UPLOAD_LIMITS,
  };
};

/**
 * هوک ساده‌تر برای آپلود سریع
 * @param type نوع پیش‌فرض تصویر
 */
export const useQuickUpload = (type?: ImageType) => {
  const upload = useUpload();

  const quickUpload = useCallback(
    async (file: File, description?: string) => {
      return upload.uploadFile(file, type, description);
    },
    [upload, type]
  );

  return {
    ...upload,
    quickUpload,
  };
};
