// src/features/products/components/ProductTypeSelect.tsx
"use client";

import { useUserSdkFeatures } from "@/api/hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import {
  PaletteIcon,
  EyeIcon,
  AlertTriangleIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductType, getAllProductTypes } from "@/constants/product-patterns";

// آیکون‌های مربوط به هر نوع محصول
const PRODUCT_TYPE_ICONS: Record<ProductType, React.ComponentType<any>> = {
  lips: EyeIcon,
  eyeshadow: EyeIcon,
  eyepencil: EyeIcon,
  eyeliner: EyeIcon,
  eyelashes: EyeIcon,
  blush: PaletteIcon,
  concealer: SparklesIcon,
  foundation: SparklesIcon,
  brows: EyeIcon,
};

interface ProductTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showSdkValidation?: boolean; // آیا بر اساس SDK کاربر محدود شود
}

export function ProductTypeSelect({
  value,
  onChange,
  className,
  disabled = false,
  placeholder,
  showSdkValidation = true,
}: ProductTypeSelectProps) {
  const { t } = useLanguage();

  const {
    sdkFeatures,
    isLoading,
    hasActivePackage,
    features,
    hasAccessToType,
  } = useUserSdkFeatures();

  // دریافت همه انواع محصولات از constants
  const allProductTypes = getAllProductTypes();

  // انواع محصولات مجاز (بر اساس SDK یا همه)
  const availableTypes = showSdkValidation
    ? hasActivePackage
      ? features.map((feature) => feature.type)
      : []
    : allProductTypes;

  // Loading state - فقط اگر SDK validation فعال باشه
  if (showSdkValidation && isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.type")}</Label>
        <div className="flex items-center gap-2 p-3 border rounded-md">
          <Loader size="sm" />
          <span className="text-sm text-muted-foreground">
            {t("products.form.loadingTypes")}
          </span>
        </div>
      </div>
    );
  }

  // No active package - فقط اگر SDK validation فعال باشه
  if (showSdkValidation && !hasActivePackage) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.type")}</Label>
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noActivePackage")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No types available
  if (availableTypes.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.type")}</Label>
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noTypesAvailable")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    const IconComponent = PRODUCT_TYPE_ICONS[type as ProductType];
    return IconComponent ? (
      <IconComponent className="h-4 w-4" />
    ) : (
      <PaletteIcon className="h-4 w-4" />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label>{t("products.form.type")}</Label>
        {availableTypes.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {availableTypes.length} {t("products.form.typesAvailable")}
          </Badge>
        )}
      </div>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue
            placeholder={placeholder || t("products.form.selectType")}
          />
        </SelectTrigger>
        <SelectContent>
          {availableTypes.map((type) => (
            <SelectItem key={type} value={type}>
              <div className="flex items-center gap-2">
                {getTypeIcon(type)}
                <span>{t(`products.types.${type}`)}</span>
                {showSdkValidation && !hasAccessToType(type) && (
                  <Badge variant="destructive" className="text-xs ml-auto">
                    {t("products.form.noAccess")}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* هشدار عدم دسترسی */}
      {showSdkValidation && value && !hasAccessToType(value) && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noAccessToSelectedType")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
