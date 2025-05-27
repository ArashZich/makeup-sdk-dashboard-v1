// src/components/common/OtpInput.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { convertPersianToEnglishNumbers } from "@/lib/numberConverter";

interface OtpInputProps {
  /**
   * تعداد خانه‌های OTP (پیش‌فرض: ۵)
   */
  length?: number;

  /**
   * مقدار فعلی OTP
   */
  value: string;

  /**
   * تابع تغییر مقدار
   */
  onChange: (value: string) => void;

  /**
   * غیرفعال کردن input ها
   */
  disabled?: boolean;

  /**
   * نمایش خطا
   */
  error?: boolean;

  /**
   * placeholder برای هر خانه
   */
  placeholder?: string;

  /**
   * کلاس‌های اضافی
   */
  className?: string;

  /**
   * سایز input ها
   */
  size?: "sm" | "md" | "lg";

  /**
   * فوکوس خودکار روی اولین input
   */
  autoFocus?: boolean;
}

export function OtpInput({
  length = 5,
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = "○",
  className,
  size = "lg",
  autoFocus = true,
}: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // تبدیل مقدار به آرایه
  const values = value.split("").slice(0, length);
  while (values.length < length) {
    values.push("");
  }

  // سایز کلاس‌ها
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-xl",
  };

  // فوکوس خودکار روی اولین خانه خالی
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = values.findIndex((val) => val === "");
      const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, [autoFocus, disabled, length]);

  const handleInputChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // تبدیل اعداد فارسی به انگلیسی
    const convertedValue = convertPersianToEnglishNumbers(inputValue);

    // فقط اعداد قبول کن
    if (convertedValue && !/^\d$/.test(convertedValue)) {
      return;
    }

    // فقط یک کاراکتر
    const newValue = convertedValue.slice(-1);

    // بروزرسانی مقادیر
    const newValues = [...values];
    newValues[index] = newValue;

    const newOtpValue = newValues.join("");
    onChange(newOtpValue);

    // اگر مقدار وارد شد، به خانه بعد برو
    if (newValue && index < length - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Backspace: پاک کردن و رفتن به خانه قبل
    if (e.key === "Backspace") {
      e.preventDefault();

      const newValues = [...values];

      if (values[index]) {
        // اگر خانه فعلی مقدار داره، پاکش کن
        newValues[index] = "";
      } else if (index > 0) {
        // اگر خانه خالیه، به خانه قبل برو و اونو پاک کن
        newValues[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      onChange(newValues.join(""));
    }

    // Delete: پاک کردن خانه فعلی
    else if (e.key === "Delete") {
      e.preventDefault();
      const newValues = [...values];
      newValues[index] = "";
      onChange(newValues.join(""));
    }

    // Arrow keys: حرکت بین خانه‌ها
    else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Home: رفتن به اول
    else if (e.key === "Home") {
      e.preventDefault();
      inputRefs.current[0]?.focus();
    }

    // End: رفتن به آخر
    else if (e.key === "End") {
      e.preventDefault();
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // انتخاب متن برای جایگزینی آسان
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (disabled) return;

    const pastedData = e.clipboardData.getData("text");
    const convertedData = convertPersianToEnglishNumbers(pastedData);

    // فقط اعداد
    const cleanedData = convertedData.replace(/\D/g, "").slice(0, length);

    onChange(cleanedData);

    // فوکوس روی آخرین خانه پر شده یا خانه بعدی
    const targetIndex = Math.min(cleanedData.length, length - 1);
    setTimeout(() => {
      inputRefs.current[targetIndex]?.focus();
    }, 0);
  };

  // کلیک روی کل کامپوننت: فوکوس روی اولین خانه خالی
  const handleContainerClick = () => {
    if (disabled) return;

    const firstEmptyIndex = values.findIndex((val) => val === "");
    const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* کانتینر input ها - همیشه LTR برای اعداد */}
      <div
        className="flex justify-center items-center gap-3 cursor-text"
        dir="ltr"
        onClick={handleContainerClick}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            value={values[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={1}
            className={cn(
              // سایز و شکل
              sizeClasses[size],
              "rounded-xl border-2 text-center font-bold",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-0",

              // حالت عادی
              "border-border bg-background text-foreground",
              "hover:border-muted-foreground/50",

              // حالت فوکوس
              focusedIndex === index && [
                "border-primary shadow-lg scale-105",
                "ring-4 ring-primary/20",
              ],

              // حالت پر شده
              values[index] && "border-primary/70 bg-primary/5",

              // حالت خطا
              error && [
                "border-destructive",
                focusedIndex === index && "ring-destructive/20",
              ],

              // حالت غیرفعال
              disabled && "opacity-50 cursor-not-allowed bg-muted",

              // اعداد همیشه LTR
              "font-mono tabular-nums direction-ltr"
            )}
          />
        ))}
      </div>

      {/* راهنما */}
      <div className="text-xs text-muted-foreground text-center">
        {value.length} / {length}
      </div>
    </div>
  );
}
