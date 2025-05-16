// src/hooks/useMediaQuery.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // در محیط SSR، mediaQuery قابل استفاده نیست
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // تنظیم مقدار اولیه
    setMatches(media.matches);

    // ثبت یک listener برای تغییرات
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // اضافه کردن listener با رعایت شرایط برای مرورگرهای قدیمی
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      // برای مرورگرهای قدیمی
      media.addListener(listener);
    }

    // پاکسازی listener در زمان unmount
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        // برای مرورگرهای قدیمی
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// هوک‌های مفید برای رسپانسیو بودن
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsLargeDesktop() {
  return useMediaQuery("(min-width: 1280px)");
}
