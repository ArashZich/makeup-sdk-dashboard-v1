// src/hooks/useScrollLock.ts
import { useEffect } from "react";

export function useScrollLock(lock: boolean = false) {
  useEffect(() => {
    // فقط در کلاینت
    if (typeof document === "undefined") return;

    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (lock) {
      // ذخیره موقعیت اسکرول
      const scrollY = window.scrollY;

      // قفل کردن اسکرول
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    }

    return () => {
      // اگر اسکرول قفل شده بود، آزاد کردن اسکرول
      if (lock) {
        const scrollY = document.body.style.top;
        document.body.style.overflow = originalStyle;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [lock]);
}
