// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";
import logger from "@/lib/logger";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // محاسبه مقدار اولیه
  const readValue = (): T => {
    // فقط در کلاینت
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // استفاده از useState به همراه تابع readValue
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // دریافت مقدار از localStorage هنگام mount شدن کامپوننت
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // به‌روزرسانی localStorage هنگام تغییر storedValue
  useEffect(() => {
    // اجرای فقط در کلاینت
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      logger.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
