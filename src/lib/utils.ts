import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ترکیب کلاس‌های CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تبدیل اعداد به فرمت پول
export function formatCurrency(
  amount: number,
  locale = "fa-IR",
  currency = "IRR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// تولید شناسه یکتا
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// حذف همه کوکی‌ها
export function clearAllCookies(): void {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

// رشته‌ی یک آدرس ایمیل را مخفی می‌کند
export function maskEmail(email: string): string {
  if (!email) return "";

  const [username, domain] = email.split("@");
  const maskedUsername =
    username.charAt(0) +
    "*".repeat(username.length - 2) +
    username.charAt(username.length - 1);

  return `${maskedUsername}@${domain}`;
}

// رشته‌ی یک شماره تلفن را مخفی می‌کند
export function maskPhone(phone: string): string {
  if (!phone) return "";

  return phone.slice(0, 4) + "*".repeat(phone.length - 7) + phone.slice(-3);
}

// تبدیل اعداد انگلیسی به فارسی
export function toFarsiNumber(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

// تبدیل اعداد فارسی به انگلیسی
export function toEnglishNumber(n: string): string {
  return n.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

// کوتاه کردن متن با نقطه‌چین
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
