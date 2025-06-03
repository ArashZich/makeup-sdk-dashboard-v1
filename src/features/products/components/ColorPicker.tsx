"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PaletteIcon,
  CheckIcon,
  ClipboardCopyIcon,
  X,
  Pipette,
  Upload,
  Trash2,
} from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { ImageColorPicker } from "react-image-color-picker";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  imageUrl?: string;
  onImageChange?: (url: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showImageUpload?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  imageUrl = "",
  onImageChange,
  placeholder = "#000000",
  className,
  disabled = false,
  showImageUpload = true,
}: ColorPickerProps) {
  const { t } = useLanguage();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");

  const { copyToClipboard, isCopied } = useClipboard({
    successMessage: t("common.copied"),
  });

  // تبدیل هر استرینگ رنگی به کد hex معتبر
  const normalizeColor = (color: string) => {
    if (color && !color.startsWith("#")) {
      return `#${color}`;
    }
    return color || "#000000";
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

  // مدیریت تغییر رنگ از input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // کپی کردن کد رنگ
  const handleCopyColor = () => {
    const normalizedColor = normalizeColor(value);
    if (isValidHex(normalizedColor)) {
      copyToClipboard(normalizedColor);
    }
  };

  // مدیریت آپلود عکس برای color picker
  const handleImageUpload = (url: string) => {
    setUploadedImage(url);
    if (onImageChange) {
      onImageChange(url);
    }
  };

  // حذف عکس آپلود شده
  const handleRemoveImage = () => {
    setUploadedImage("");
    if (onImageChange) {
      onImageChange("");
    }
  };

  // مدیریت انتخاب رنگ از عکس
  const handleImageColorPick = (color: string) => {
    // تبدیل RGB به HEX اگر لازم باشه
    let hexColor = color;

    // اگر رنگ RGB فرمت باشه، تبدیل به HEX کن
    if (color.startsWith("rgb")) {
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        hexColor = `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      }
    }

    onChange(hexColor);
  };

  // رنگ نرمال شده برای نمایش
  const normalizedValue = normalizeColor(value);
  const isValidColor = isValidHex(normalizedValue);

  // عکسی که باید نمایش داده بشه
  const displayImage = uploadedImage || imageUrl;

  return (
    <div className="space-y-3">
      {/* انتخاب رنگ */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            value={value || ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            className="w-10 h-10 p-0 rounded-md flex items-center justify-center"
            style={{
              backgroundColor: isValidColor ? normalizedValue : "#ffffff",
            }}
            disabled={disabled}
            onClick={() => setIsPickerOpen(!isPickerOpen)}
          >
            <PaletteIcon
              className={`h-4 w-4 ${
                isValidColor ? "text-white dark:text-black" : "text-gray-500"
              }`}
            />
          </Button>
        </div>

        {/* Color Picker Modal */}
        {isPickerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className="bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PaletteIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t("products.form.selectColor")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("products.form.chooseColorDescription")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={() => setIsPickerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side - Color Picker */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("products.form.manualSelection")}
                      </h4>
                      <div className="flex justify-center">
                        <div className="relative">
                          <HexColorPicker
                            color={isValidColor ? normalizedValue : "#000000"}
                            onChange={(color) => onChange(color)}
                            className="!w-56 !h-56"
                          />
                        </div>
                      </div>

                      {/* Preset Colors */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
                          {t("products.form.presetColors")}
                        </label>
                        <div className="grid grid-cols-5 gap-2 p-3 rounded-lg border bg-muted/30">
                          {presetColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`
                                relative w-9 h-9 rounded-lg border-2 cursor-pointer 
                                transition-all duration-200 hover:scale-110 hover:shadow-md
                                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                ${
                                  normalizedValue.toLowerCase() ===
                                  color.toLowerCase()
                                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
                                    : "border-border hover:border-primary/50"
                                }
                              `}
                              style={{ backgroundColor: color }}
                              onClick={() => onChange(color)}
                              title={color.toUpperCase()}
                            >
                              {normalizedValue.toLowerCase() ===
                                color.toLowerCase() && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <CheckIcon className="h-3 w-3 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Image Color Extractor */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Pipette className="h-4 w-4" />
                        {t("products.form.extractFromImage")}
                      </h4>

                      {/* Image Upload */}
                      {!displayImage && (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-4">
                            {t("products.form.uploadImageForColor")}
                          </p>
                          <ImageUpload
                            value=""
                            onChange={handleImageUpload}
                            type="color"
                            size="md"
                            placeholder={t("products.form.uploadImage")}
                            disabled={disabled}
                          />
                        </div>
                      )}

                      {/* Image Color Picker */}
                      {displayImage && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {t("products.form.uploadedImage")}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveImage}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="border rounded-lg overflow-hidden bg-muted/30 p-2">
                            <ImageColorPicker
                              onColorPick={handleImageColorPick}
                              imgSrc={displayImage}
                              zoom={0.5}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Color Display */}
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-sm font-medium">
                      {t("products.form.selectedColor")}
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-background shadow-sm flex-shrink-0"
                        style={{ backgroundColor: normalizedValue }}
                      />
                      <div className="flex-1">
                        <Input
                          value={normalizedValue}
                          onChange={handleInputChange}
                          className="font-mono text-sm bg-background"
                          placeholder="#000000"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("products.form.hexColorCode")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyColor}
                        className="gap-2 flex-shrink-0"
                      >
                        {isCopied ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardCopyIcon className="h-4 w-4" />
                        )}
                        {isCopied ? t("common.copied") : t("common.copy")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 border-t flex-shrink-0">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsPickerOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => setIsPickerOpen(false)}
                  >
                    <CheckIcon className="h-4 w-4" />
                    {t("common.apply")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نمایش رنگ و کپی */}
        {value && isValidColor && (
          <div className="flex items-center">
            <div
              className="h-6 flex-1 rounded-md border flex items-center justify-center text-xs cursor-pointer"
              style={{
                backgroundColor: normalizedValue,
                color:
                  normalizedValue.replace("#", "").toLowerCase() < "888888"
                    ? "white"
                    : "black",
              }}
              onClick={handleCopyColor}
              title={t("common.copy")}
            >
              {normalizedValue.toUpperCase()}

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

      {/* آپلود عکس رنگ (اختیاری) */}
      {showImageUpload && !uploadedImage && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("products.form.colorImage")}
          </label>
          <ImageUpload
            value={imageUrl}
            onChange={handleImageUpload}
            type="color"
            size="sm"
            placeholder={t("products.form.uploadColorImage")}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
