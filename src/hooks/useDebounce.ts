// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * هوک debounce برای تاخیر در اجرای تابع
 * @param value مقدار ورودی که باید debounce شود
 * @param delay تاخیر به میلی‌ثانیه (پیش‌فرض: 500ms)
 * @returns مقدار debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // تنظیم timeout برای به‌روزرسانی مقدار debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // پاک کردن timeout در صورت تغییر value یا unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * هوک ترکیبی برای search با debounce
 * @param initialValue مقدار اولیه جستجو
 * @param delay تاخیر debounce (پیش‌فرض: 500ms)
 * @returns آبجکت شامل searchTerm، debouncedSearchTerm و setSearchTerm
 */
export function useDebouncedSearch(
  initialValue: string = "",
  delay: number = 500
) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
}
