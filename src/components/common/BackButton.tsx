// src/components/common/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import logger from "@/lib/logger";

interface BackButtonProps {
  /**
   * متن نمایش داده شده روی دکمه
   * اگر ارائه نشود، از ترجمه "common.back" استفاده می‌شود
   */
  label?: string;

  /**
   * مسیری که باید به آن برگرد
   * اگر ارائه نشود، از router.back() استفاده می‌شود
   */
  href?: string;

  /**
   * تابع سفارشی برای مدیریت کلیک
   * اگر ارائه شود، href و router.back() نادیده گرفته می‌شوند
   */
  onClick?: () => void;

  /**
   * سایز دکمه
   */
  size?: "default" | "sm" | "lg" | "icon";

  /**
   * variant دکمه
   */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  /**
   * کلاس‌های CSS اضافی
   */
  className?: string;

  /**
   * غیرفعال کردن دکمه
   */
  disabled?: boolean;

  /**
   * نمایش فقط آیکون (بدون متن)
   */
  iconOnly?: boolean;

  /**
   * سایز آیکون
   */
  iconSize?: number;
}

export function BackButton({
  label,
  href,
  onClick,
  size = "sm",
  variant = "ghost",
  className,
  disabled = false,
  iconOnly = false,
  iconSize = 16,
}: BackButtonProps) {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // تعیین متن نمایشی
  const displayLabel = label || t("common.back");

  // تعیین آیکون بر اساس جهت زبان
  // در RTL (فارسی): ArrowRight چون بازگشت به سمت راست هست
  // در LTR (انگلیسی): ArrowLeft چون بازگشت به سمت چپ هست
  const IconComponent = isRtl ? ArrowRight : ArrowLeft;

  // مدیریت کلیک
  const handleClick = () => {
    if (disabled) return;

    if (onClick) {
      logger.api("BackButton: Custom click handler called");
      onClick();
    } else if (href) {
      logger.api("BackButton: Navigating to:", href);
      router.push(href);
    } else {
      logger.api("BackButton: Going back in history");
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2",
        iconOnly && "px-2", // کمتر padding برای حالت icon-only
        className
      )}
      title={iconOnly ? displayLabel : undefined} // tooltip برای حالت icon-only
    >
      <IconComponent
        className={cn(
          "shrink-0",
          // سایز آیکون بر اساس سایز دکمه
          size === "sm" && "h-4 w-4",
          size === "default" && "h-5 w-5",
          size === "lg" && "h-6 w-6",
          size === "icon" && "h-4 w-4"
        )}
        size={iconSize}
      />

      {/* نمایش متن فقط اگر iconOnly فعال نباشد */}
      {!iconOnly && <span className="font-medium">{displayLabel}</span>}
    </Button>
  );
}

// ✅ کامپوننت‌های مخصوص برای استفاده‌های رایج
export function BackButtonSmall(
  props: Omit<BackButtonProps, "size" | "variant">
) {
  return <BackButton {...props} size="sm" variant="ghost" />;
}

export function BackButtonOutline(props: Omit<BackButtonProps, "variant">) {
  return <BackButton {...props} variant="outline" />;
}

export function BackButtonIcon(props: Omit<BackButtonProps, "iconOnly">) {
  return <BackButton {...props} iconOnly={true} size="icon" />;
}

// Example
// 1. ساده‌ترین حالت
{
  /* <BackButton />

// 2. با متن سفارشی
<BackButton label="بازگشت به لیست" />

// 3. با مسیر مشخص
<BackButton href="/dashboard" />

// 4. با متن و مسیر
<BackButton 
  label="بازگشت به داشبورد" 
  href="/dashboard" 
/>

// 5. outline variant
<BackButton variant="outline" />

// 6. سایز بزرگ
<BackButton size="lg" />

// 7. فقط آیکون
<BackButton iconOnly />

// 8. با onClick سفارشی
<BackButton 
  label="بازگشت"
  onClick={() => console.log("back clicked")}
/>

// 9. کامپوننت‌های آماده
<BackButtonSmall />
<BackButtonOutline />
<BackButtonIcon />

// 10. با className اضافی
<BackButton 
  className="bg-red-50 hover:bg-red-100" 
  variant="outline"
/> */
}
