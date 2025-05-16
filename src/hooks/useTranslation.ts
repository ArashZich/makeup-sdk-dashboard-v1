// src/hooks/useTranslation.ts
import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  const { t, locale, setLocale, direction, isRtl } = useLanguage();

  return {
    t,
    locale,
    setLocale,
    direction,
    isRtl,
  };
}
