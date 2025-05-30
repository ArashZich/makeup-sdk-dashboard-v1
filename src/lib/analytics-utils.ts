// src/lib/analytics-utils.ts

/**
 * تبدیل نرخ موفقیت به عدد
 */
export function parseSuccessRate(
  rate: string | number | undefined | null
): number {
  // چک کردن مقادیر null، undefined یا خالی
  if (!rate || rate === null || rate === undefined) return 0;

  // اگر string است
  if (typeof rate === "string") {
    // اگر string خالی باشد
    if (rate.trim() === "") return 0;

    // حذف % و space‌ها و تبدیل به عدد
    const cleanRate = rate.replace(/[%\s]/g, "");
    const parsed = parseFloat(cleanRate);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed)); // محدود به 0-100
  }

  // اگر number است
  if (typeof rate === "number") {
    return isNaN(rate) ? 0 : Math.max(0, Math.min(100, rate)); // محدود به 0-100
  }

  return 0;
}

/**
 * فرمت کردن نرخ موفقیت برای نمایش
 */
export function formatSuccessRate(
  rate: string | number | undefined | null
): string {
  // چک کردن مقادیر null، undefined یا خالی
  if (!rate || rate === null || rate === undefined) return "0%";

  // اگر string است و قبلاً % دارد و معتبر است
  if (typeof rate === "string") {
    if (rate.trim() === "") return "0%";

    // اگر قبلاً % دارد، چک کنیم معتبر باشد
    if (rate.includes("%")) {
      const numPart = parseSuccessRate(rate);
      return `${numPart.toFixed(1)}%`;
    }
  }

  // در غیر این صورت % اضافه کن
  const numRate = parseSuccessRate(rate);
  return `${numRate.toFixed(1)}%`;
}

/**
 * محاسبه نرخ موفقیت از تعداد موفق و ناموفق
 */
export function calculateSuccessRate(success: number, failed: number): string {
  const total = success + failed;
  if (total === 0) return "0%";

  const rate = (success / total) * 100;
  return `${rate.toFixed(1)}%`;
}

/**
 * بررسی معتبر بودن نرخ موفقیت
 */
export function isValidSuccessRate(rate: any): boolean {
  if (!rate) return false;

  const parsed = parseSuccessRate(rate);
  return parsed >= 0 && parsed <= 100;
}
