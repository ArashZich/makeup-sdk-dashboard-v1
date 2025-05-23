"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import {
  SwatchBookIcon,
  PlusIcon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatternSelectProps {
  productType: string;
  selectedPatterns: string[];
  onChange: (patterns: string[]) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export function PatternSelect({
  productType,
  selectedPatterns,
  onChange,
  className,
  disabled = false,
  multiple = true,
}: PatternSelectProps) {
  const { t } = useLanguage();
  const [selectedPattern, setSelectedPattern] = useState<string>("");

  const {
    sdkFeatures,
    isLoading,
    hasActivePackage,
    getPatternsForType,
    hasAccessToType,
  } = useUserSdkFeatures();

  // دریافت پترن‌های مجاز برای نوع محصول
  const availablePatterns = getPatternsForType(productType);
  const hasAccess = hasAccessToType(productType);

  // پاک کردن انتخاب پترن وقتی نوع محصول تغییر می‌کنه
  useEffect(() => {
    if (productType && (!hasAccess || availablePatterns.length === 0)) {
      onChange([]);
    }
  }, [productType, hasAccess, availablePatterns.length, onChange]);

  const handleAddPattern = () => {
    if (selectedPattern && !selectedPatterns.includes(selectedPattern)) {
      if (multiple) {
        onChange([...selectedPatterns, selectedPattern]);
      } else {
        onChange([selectedPattern]);
      }
      setSelectedPattern("");
    }
  };

  const handleRemovePattern = (pattern: string) => {
    onChange(selectedPatterns.filter((p) => p !== pattern));
  };

  const handleSingleSelect = (pattern: string) => {
    onChange([pattern]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.patterns")}</Label>
        <div className="flex items-center gap-2 p-3 border rounded-md">
          <Loader size="sm" />
          <span className="text-sm text-muted-foreground">
            {t("products.form.loadingPatterns")}
          </span>
        </div>
      </div>
    );
  }

  // No active package
  if (!hasActivePackage) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.patterns")}</Label>
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noActivePackage")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No access to product type
  if (!hasAccess) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.patterns")}</Label>
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noAccessToType", { type: productType })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No patterns available for this type
  if (availablePatterns.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.patterns")}</Label>
        <Alert>
          <SwatchBookIcon className="h-4 w-4" />
          <AlertDescription>
            {t("products.form.noPatternsAvailable", { type: productType })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Single select mode
  if (!multiple) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{t("products.form.pattern")}</Label>
        <Select
          value={selectedPatterns[0] || ""}
          onValueChange={handleSingleSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("products.form.selectPattern")} />
          </SelectTrigger>
          <SelectContent>
            {availablePatterns.map((pattern) => (
              <SelectItem key={pattern} value={pattern}>
                <div className="flex items-center gap-2">
                  <SwatchBookIcon className="h-4 w-4" />
                  {pattern}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Multiple select mode
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label>{t("products.form.patterns")}</Label>
        <span className="text-xs text-muted-foreground">
          {selectedPatterns.length} {t("products.form.patternsSelected")}
        </span>
      </div>

      {/* Selected patterns */}
      {selectedPatterns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPatterns.map((pattern) => (
            <Badge
              key={pattern}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <SwatchBookIcon className="h-3 w-3" />
              {pattern}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemovePattern(pattern)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Add new pattern */}
      {!disabled && (
        <div className="flex gap-2">
          <Select
            value={selectedPattern}
            onValueChange={setSelectedPattern}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("products.form.selectPattern")} />
            </SelectTrigger>
            <SelectContent>
              {availablePatterns
                .filter((pattern) => !selectedPatterns.includes(pattern))
                .map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>
                    <div className="flex items-center gap-2">
                      <SwatchBookIcon className="h-4 w-4" />
                      {pattern}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddPattern}
            disabled={
              !selectedPattern || selectedPatterns.includes(selectedPattern)
            }
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Available patterns info */}
      <div className="text-xs text-muted-foreground">
        {t("products.form.availablePatterns")}: {availablePatterns.length}
      </div>
    </div>
  );
}
