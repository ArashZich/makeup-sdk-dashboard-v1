"use client";

import { useState, useRef } from "react";
import { useUpload } from "@/api/hooks/useUpload";
import { ImageType } from "@/api/types/upload.types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  type?: ImageType;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ImageUpload({
  value,
  onChange,
  type = "general",
  className,
  placeholder,
  disabled = false,
  size = "md",
}: ImageUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    uploadFile,
    cancelUpload,
    resetUpload,
    isUploading,
    progress,
    hasError,
    error,
    getUploadedImageUrl,
    formatFileSize,
    uploadLimits,
    validateFile,
  } = useUpload();

  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const handleFileSelect = async (file: File) => {
    if (disabled || !validateFile(file)) return;

    try {
      const result = await uploadFile(file, type);

      if (result.success) {
        // برای محصول: original URL
        // برای رنگ: thumbnail URL
        const imageUrl =
          type === "product"
            ? result.data.urls.original.url
            : result.data.urls.thumbnail.url;

        onChange(imageUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = () => {
    onChange("");
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    cancelUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          sizeClasses[size],
          "relative border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden",
          {
            "border-primary bg-primary/5": dragActive && !disabled,
            "border-muted-foreground/25 hover:border-muted-foreground/50":
              !dragActive && !disabled && !value,
            "border-muted-foreground/25": disabled,
            "cursor-not-allowed opacity-50": disabled,
          }
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={uploadLimits.allowedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* نمایش تصویر موجود */}
        {value && !isUploading && (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* حالت آپلود */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-2">
            <Progress value={progress} className="w-full h-2 mb-2" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="mt-2"
            >
              {t("common.cancel")}
            </Button>
          </div>
        )}

        {/* حالت خطا */}
        {hasError && !isUploading && (
          <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center p-2">
            <AlertCircle className="h-6 w-6 text-destructive mb-1" />
            <span className="text-xs text-destructive text-center">
              {error?.message}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="mt-2"
            >
              {t("common.retry")}
            </Button>
          </div>
        )}

        {/* حالت خالی */}
        {!value && !isUploading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              {placeholder || t("upload.clickOrDrag")}
            </span>
          </div>
        )}
      </div>

      {/* راهنمای آپلود */}
      <div className="text-xs text-muted-foreground">
        {t("upload.maxSize")}: {formatFileSize(uploadLimits.maxFileSize)}
      </div>
    </div>
  );
}
