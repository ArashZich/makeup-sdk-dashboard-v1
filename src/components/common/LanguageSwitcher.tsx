// src/components/common/LanguageSwitcher.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <GlobeIcon className="h-4 w-4" />
          <span className="sr-only">{t("common.language.change")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale("fa")}
          className={locale === "fa" ? "bg-muted" : ""}
        >
          <span className="ms-2">🇮🇷</span>
          {t("common.language.fa")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className={locale === "en" ? "bg-muted" : ""}
        >
          <span className="ms-2">🇬🇧</span>
          {t("common.language.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
