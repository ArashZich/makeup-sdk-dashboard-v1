// src/features/settings/components/AppearanceSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettingsStore, ThemeMode } from "@/store/settings.store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export function AppearanceSettings() {
  const { t, locale, setLocale } = useLanguage();
  const { setTheme: setThemeStore } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // این useEffect برای جلوگیری از hydration mismatch استفاده می‌شود
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // تغییر تم
  const handleThemeChange = (theme: ThemeMode) => {
    setTheme(theme);
    setThemeStore(theme);
  };

  // تغییر زبان
  const handleLanguageChange = (value: string) => {
    setLocale(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.appearance.title")}</CardTitle>
        <CardDescription>
          {t("settings.appearance.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* تنظیمات تم */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            {t("settings.appearance.theme")}
          </h3>
          <RadioGroup
            defaultValue={theme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-6 w-6 mb-3" />
                <span className="text-sm font-normal">
                  {t("common.theme.light")}
                </span>
              </Label>
            </div>
            <div>
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-6 w-6 mb-3" />
                <span className="text-sm font-normal">
                  {t("common.theme.dark")}
                </span>
              </Label>
            </div>
            <div>
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="sr-only"
                />
                <Monitor className="h-6 w-6 mb-3" />
                <span className="text-sm font-normal">
                  {t("common.theme.system")}
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* تنظیمات زبان */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            {t("settings.appearance.language")}
          </h3>
          <Select defaultValue={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue
                placeholder={t("settings.appearance.selectLanguage")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fa">
                <div className="flex items-center">
                  <span className="me-2">🇮🇷</span>
                  <span>{t("common.language.fa")}</span>
                  {locale === "fa" && <Check className="ml-auto h-4 w-4" />}
                </div>
              </SelectItem>
              <SelectItem value="en">
                <div className="flex items-center">
                  <span className="me-2">🇬🇧</span>
                  <span>{t("common.language.en")}</span>
                  {locale === "en" && <Check className="ml-auto h-4 w-4" />}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
