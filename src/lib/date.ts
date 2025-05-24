// src/lib/date.ts
import { DateTime } from "luxon";

// تبدیل تاریخ میلادی به شمسی
export function toJalali(date: Date | string): string {
  const dateTime = DateTime.fromJSDate(
    typeof date === "string" ? new Date(date) : date
  );
  return dateTime.setLocale("fa").toLocaleString(DateTime.DATE_FULL);
}

// تبدیل تاریخ شمسی به میلادی
export function toGregorian(jalaliDate: string): Date {
  const dateTime = DateTime.fromFormat(jalaliDate, "yyyy/MM/dd", {
    locale: "fa",
  });
  return dateTime.toJSDate();
}

// محاسبه تعداد روزهای باقی‌مانده
export function getDaysRemaining(endDate: Date | string): number {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

// فرمت کردن تاریخ نسبی (مثلاً "۲ روز پیش")
export function formatRelativeTime(date: Date | string, locale = "fa"): string {
  const dateTime =
    typeof date === "string"
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date);

  return dateTime.setLocale(locale).toRelative() || "";
}

// تبدیل تایم‌استمپ به تاریخ
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// تبدیل تاریخ به تایم‌استمپ
export function dateToTimestamp(date: Date | string): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return Math.floor(dateObj.getTime() / 1000);
}

// محاسبه مدت زمان بین دو تاریخ
export function getDuration(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start =
    typeof startDate === "string"
      ? DateTime.fromISO(startDate)
      : DateTime.fromJSDate(startDate);
  const end =
    typeof endDate === "string"
      ? DateTime.fromISO(endDate)
      : DateTime.fromJSDate(endDate);

  const diff = end.diff(start, ["years", "months", "days"]).toObject();

  const parts = [];
  if (diff.years && diff.years > 0) parts.push(`${Math.floor(diff.years)} سال`);
  if (diff.months && diff.months > 0)
    parts.push(`${Math.floor(diff.months)} ماه`);
  if (diff.days && diff.days > 0) parts.push(`${Math.floor(diff.days)} روز`);

  return parts.join(" و ") || "کمتر از یک روز";
}

// فرمت کردن تاریخ برای نمایش (تابع جدید)
export function formatDate(date: Date | string, locale = "fa-IR"): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}
