"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, RefreshCw } from "lucide-react";
import { PaymentsTimeRange } from "@/api/types/payments.types";

interface RevenueTimeRangeSelectorProps {
  selectedRange: PaymentsTimeRange;
  onRangeChange: (range: PaymentsTimeRange) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function RevenueTimeRangeSelector({
  selectedRange,
  onRangeChange,
  onRefresh,
  isLoading = false,
}: RevenueTimeRangeSelectorProps) {
  const { t } = useLanguage();

  const timeRanges: { value: PaymentsTimeRange; label: string }[] = [
    { value: "week", label: t("admin.analytics.timeRange.week") },
    { value: "month", label: t("admin.analytics.timeRange.month") },
    { value: "halfyear", label: t("admin.analytics.timeRange.halfyear") },
    { value: "year", label: t("admin.analytics.timeRange.year") },
    { value: "all", label: t("admin.analytics.timeRange.all") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {t("admin.analytics.timeRange.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              value={selectedRange}
              onValueChange={(value: PaymentsTimeRange) => onRangeChange(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("admin.analytics.timeRange.select")}
                />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("common.refresh")}
            </Button>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {t("admin.analytics.timeRange.selected")}:{" "}
            <span className="font-medium">
              {timeRanges.find((r) => r.value === selectedRange)?.label}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
