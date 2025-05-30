// src/lib/analytics-utils.ts

/**
 * تبدیل نرخ موفقیت به عدد
 */
export function parseSuccessRate(rate: string | number | undefined): number {
  if (!rate) return 0;

  // اگر string است
  if (typeof rate === "string") {
    return parseFloat(rate.replace("%", "").trim()) || 0;
  }

  // اگر number است
  if (typeof rate === "number") {
    return isNaN(rate) ? 0 : rate;
  }

  return 0;
}

/**
 * فرمت کردن نرخ موفقیت برای نمایش
 */
export function formatSuccessRate(rate: string | number | undefined): string {
  if (!rate) return "0%";

  // اگر string است و قبلاً % دارد
  if (typeof rate === "string" && rate.includes("%")) {
    return rate;
  }

  // در غیر این صورت % اضافه کن
  const numRate = parseSuccessRate(rate);
  return `${numRate}%`;
}
