// src/features/products/components/ProductAnalyticsPreview.tsx
"use client";

import { useUserAnalytics } from "@/api/hooks/useAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/api/types/products.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, BarChart3, AlertCircle } from "lucide-react";

interface ProductAnalyticsPreviewProps {
  product: Product;
  className?: string;
}

export function ProductAnalyticsPreview({
  product,
  className,
}: ProductAnalyticsPreviewProps) {
  const { t } = useLanguage();

  const { getProductAnalyticsById } = useUserAnalytics();

  // دریافت آنالیتیکس محدود برای پیش‌نمایش (فقط ماه گذشته)
  const {
    data: analytics,
    isLoading,
    error,
  } = getProductAnalyticsById(product._id, "month");

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-3 flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{t("analytics.noData")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium">
              {t("analytics.thisMonth")}
            </span>
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            {analytics.successRate.rate}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">
                {t("analytics.requests")}
              </span>
            </div>
            <span className="font-medium">{analytics.totalRequests}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground">
                {t("analytics.success")}
              </span>
            </div>
            <span className="font-medium text-green-600">
              {analytics.successRate.success}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
