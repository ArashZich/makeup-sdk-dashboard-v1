// src/features/analytics/components/UsageStatsCard.tsx
"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface UsageStatsCardProps {
  title: string;
  description?: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  format?: "number" | "currency" | "percentage";
  isLoading?: boolean;
}

export function UsageStatsCard({
  title,
  description,
  value,
  maxValue,
  icon,
  className,
  valuePrefix = "",
  valueSuffix = "",
  format = "number",
  isLoading = false,
}: UsageStatsCardProps) {
  const { t, isRtl } = useLanguage();
  const percentage = Math.min(100, (value / maxValue) * 100);

  const formatValue = () => {
    if (format === "currency") {
      return formatCurrency(value, isRtl ? "fa-IR" : "en-US", "USD");
    } else if (format === "percentage") {
      return `${Math.round(percentage)}%`;
    } else {
      return value.toLocaleString(isRtl ? "fa-IR" : "en-US");
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-[100px] mb-2" />
            <Skeleton className="h-4 w-full" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {valuePrefix}
              {formatValue()}
              {valueSuffix}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span>{description || t("analytics.usageProgress")}</span>
                <span>
                  {value} / {maxValue} ({Math.round(percentage)}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
