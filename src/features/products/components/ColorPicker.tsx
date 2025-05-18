"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaletteIcon, CheckIcon, ClipboardCopyIcon } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  placeholder = "#000000",
  className,
}: ColorPickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { copyToClipboard, isCopied } = useClipboard({
    successMessage: t("common.copied"),
  });

  // تبدیل هر استرینگ رنگی به کد hex معتبر
  const normalizeColor = (color: string) => {
    // اگر با # شروع نشده باشد، اضافه کن
    if (color && !color.startsWith("#")) {
      return `#${color}`;
    }
    return color;
  };

  // اعتبارسنجی کد رنگ hex
  const isValidHex = (color: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };

  // رنگ‌های از پیش تعریف شده
  const presetColors = [
    "#ff0000",
    "#ff4500",
    "#ff8c00",
    "#ffd700",
    "#008000",
    "#00ced1",
    "#0000ff",
    "#4b0082",
    "#800080",
    "#ff00ff",
    "#ff1493",
    "#ff69b4",
    "#000000",
    "#808080",
    "#ffffff",
  ];

  // کپی کردن کد رنگ
  const handleCopyColor = () => {
    if (value && isValidHex(normalizeColor(value))) {
      copyToClipboard(normalizeColor(value));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-10 h-10 p-0 rounded-md flex items-center justify-center"
              style={{
                backgroundColor: isValidHex(normalizeColor(value))
                  ? normalizeColor(value)
                  : "#ffffff",
              }}
            >
              <PaletteIcon
                className={`h-4 w-4 ${
                  value && isValidHex(normalizeColor(value))
                    ? "text-white dark:text-black"
                    : "text-gray-500"
                }`}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <HexColorPicker
              color={
                isValidHex(normalizeColor(value))
                  ? normalizeColor(value)
                  : "#000000"
              }
              onChange={onChange}
              className="mb-3"
            />

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {t("products.form.presetColors")}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-md border cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {value && isValidHex(normalizeColor(value)) && (
        <div className="flex items-center">
          <div
            className="h-6 flex-1 rounded-md border flex items-center justify-center text-xs cursor-pointer"
            style={{
              backgroundColor: normalizeColor(value),
              color:
                value.replace("#", "").toLowerCase() < "888888"
                  ? "white"
                  : "black",
            }}
            onClick={handleCopyColor}
            title={t("common.copy")}
          >
            {normalizeColor(value).toUpperCase()}

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyColor();
              }}
            >
              {isCopied ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                <ClipboardCopyIcon className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
