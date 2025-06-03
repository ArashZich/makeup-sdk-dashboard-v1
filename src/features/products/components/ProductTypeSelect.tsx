// src/features/products/components/ProductTypeSelect.tsx - Updated
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
import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductType, getAllProductTypes } from "@/constants/product-patterns";
import { PRODUCT_TYPE_ICONS } from "@/components/icons/MakeupIcons";

interface ProductTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showSdkValidation?: boolean;
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

  const allProductTypes = getAllProductTypes();

  const availableTypes = showSdkValidation
    ? hasActivePackage
      ? features.map((feature) => feature.type)
      : []
    : allProductTypes;

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

  // دریافت آیکون برای هر نوع محصول
  const getTypeIcon = (type: string) => {
    const IconComponent = PRODUCT_TYPE_ICONS[type as ProductType];
    return IconComponent ? IconComponent : PRODUCT_TYPE_ICONS.lips; // fallback
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
        <SelectTrigger className="h-12">
          <SelectValue
            placeholder={placeholder || t("products.form.selectType")}
          />
        </SelectTrigger>
        <SelectContent>
          {availableTypes.map((type) => {
            const IconComponent = getTypeIcon(type);
            return (
              <SelectItem
                key={type}
                value={type}
                className="h-12 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t(`products.types.${type}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(`products.typeDescriptions.${type}`)}
                    </span>
                  </div>
                  {showSdkValidation && !hasAccessToType(type) && (
                    <Badge variant="destructive" className="text-xs ml-auto">
                      {t("products.form.noAccess")}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

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
