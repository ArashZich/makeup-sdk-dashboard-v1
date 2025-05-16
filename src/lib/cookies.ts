// src/lib/cookies.ts
import Cookies from "js-cookie";

export interface CookieOptions extends Cookies.CookieAttributes {
  name?: string;
  value?: string;
}

export const useCookies = () => {
  // تنظیم یک کوکی
  const setCookie = (
    name: string,
    value: string,
    options?: CookieOptions
  ): void => {
    Cookies.set(name, value, options);
  };

  // دریافت مقدار یک کوکی
  const getCookie = (name: string): string | undefined => {
    return Cookies.get(name);
  };

  // حذف یک کوکی
  const removeCookie = (name: string, options?: CookieOptions): void => {
    Cookies.remove(name, options);
  };

  // بررسی وجود یک کوکی
  const hasCookie = (name: string): boolean => {
    return !!Cookies.get(name);
  };

  return {
    setCookie,
    getCookie,
    removeCookie,
    hasCookie,
  };
};
