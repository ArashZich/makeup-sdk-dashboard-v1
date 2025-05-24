// src/contexts/LanguageContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useCookies } from "@/lib/cookies";
import { iranSans, montserrat } from "@/lib/fonts";

import faMessages from "@/messages/fa.json";
import enMessages from "@/messages/en.json";

const messages: Record<string, any> = {
  fa: faMessages,
  en: enMessages,
};

type LanguageContextType = {
  locale: string;
  direction: "rtl" | "ltr";
  isRtl: boolean;
  messages: any;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "fa",
  direction: "rtl",
  isRtl: true,
  messages: faMessages,
  setLocale: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

// متد برای اعمال زبان و فونت
const applyLanguageAndFontSettings = (locale: string) => {
  if (typeof window !== "undefined") {
    const dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;

    // تنظیم متغیرهای CSS برای RTL
    document.documentElement.style.setProperty(
      "--start",
      locale === "fa" ? "right" : "left"
    );
    document.documentElement.style.setProperty(
      "--end",
      locale === "fa" ? "left" : "right"
    );

    // حذف کلاس‌های قبلی
    document.documentElement.classList.remove(
      "rtl",
      "ltr",
      "lang-fa",
      "lang-en"
    );

    // اضافه کردن کلاس‌های جدید
    document.documentElement.classList.add(dir);
    document.documentElement.classList.add(`lang-${locale}`);

    // تنظیم فونت بر اساس زبان
    if (locale === "fa") {
      document.body.style.fontFamily =
        iranSans.style.fontFamily + ", sans-serif";
    } else {
      document.body.style.fontFamily =
        montserrat.style.fontFamily + ", sans-serif";
    }
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { getCookie, setCookie } = useCookies();
  const [locale, setLocaleState] = useState("fa");
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [currentMessages, setCurrentMessages] = useState<any>(faMessages);
  const isRtl = direction === "rtl";

  useEffect(() => {
    const savedLocale = getCookie("NEXT_LOCALE") || "fa";
    setLocaleState(savedLocale);
    setCurrentMessages(
      messages[savedLocale as keyof typeof messages] || faMessages
    );
    setDirection(savedLocale === "fa" ? "rtl" : "ltr");
    applyLanguageAndFontSettings(savedLocale);
  }, [getCookie]);

  const setLocale = (newLocale: string) => {
    if (newLocale !== locale && (newLocale === "fa" || newLocale === "en")) {
      setCookie("NEXT_LOCALE", newLocale, { expires: 365 });
      setLocaleState(newLocale);
      setCurrentMessages(messages[newLocale as keyof typeof messages]);
      setDirection(newLocale === "fa" ? "rtl" : "ltr");
      applyLanguageAndFontSettings(newLocale);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const parts = key.split(".");
    let result: any = currentMessages;
    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        result = result[part];
      } else {
        return key;
      }
    }

    if (typeof result !== "string") {
      return key;
    }

    // اگر پارامتری وجود نداشته باشد، متن را برگردان
    if (!params) {
      return result;
    }

    // جایگزینی پارامترها در متن
    return result.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return params[paramName] !== undefined
        ? String(params[paramName])
        : match;
    });
  };

  // اطمینان از اینکه فونت پس از mount شدن کامپوننت و تعیین locale اعمال می‌شود
  useEffect(() => {
    applyLanguageAndFontSettings(locale);
  }, [locale]);

  const value = {
    locale,
    direction,
    isRtl,
    messages: currentMessages,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      <DirectionProvider dir={direction}>{children}</DirectionProvider>
    </LanguageContext.Provider>
  );
};
