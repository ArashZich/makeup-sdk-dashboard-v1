"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import {
  PaymentsAllPlatformsStatsResponse,
  PaymentsTimeRange,
} from "@/api/types/payments.types";
import { logger } from "@/lib/logger";

interface RevenueExportButtonProps {
  data: PaymentsAllPlatformsStatsResponse | null;
  timeRange: PaymentsTimeRange;
  isLoading?: boolean;
}

export function RevenueExportButton({
  data,
  timeRange,
  isLoading = false,
}: RevenueExportButtonProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const generateCSVData = () => {
    if (!data) return "";

    const headers = [
      t("admin.analytics.export.platform"),
      t("admin.analytics.revenue.totalRevenue"),
      t("admin.analytics.revenue.totalOrders"),
      t("admin.analytics.revenue.avgOrderValue"),
    ];

    const platforms = [
      { key: "normal", label: t("admin.analytics.revenue.platforms.normal") },
      { key: "divar", label: t("admin.analytics.revenue.platforms.divar") },
      { key: "torob", label: t("admin.analytics.revenue.platforms.torob") },
      { key: "basalam", label: t("admin.analytics.revenue.platforms.basalam") },
    ];

    const rows = platforms.map((platform) => {
      const platformData =
        data.platforms[platform.key as keyof typeof data.platforms];
      if (platformData) {
        return [
          platform.label,
          platformData.totalRevenue || 0,
          platformData.totalOrders || 0,
          platformData.totalOrders > 0
            ? platformData.totalRevenue / platformData.totalOrders
            : 0,
        ];
      }
      return [platform.label, 0, 0, 0];
    });

    // اضافه کردن سطر کل
    rows.push([
      t("admin.analytics.export.total"),
      data.summary.totalRevenue,
      data.summary.totalOrders,
      data.summary.avgOrderValue,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  };

  const generateJSONData = () => {
    if (!data) return "{}";

    const exportData = {
      timeRange,
      exportDate: new Date().toISOString(),
      data: data,
      summary: {
        totalPlatforms: Object.keys(data.platforms).length,
        totalRevenue: data.summary.totalRevenue,
        totalOrders: data.summary.totalOrders,
        avgOrderValue: data.summary.avgOrderValue,
      },
    };

    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleExport = async (format: "csv" | "json") => {
    if (!data) return;

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseFilename = `revenue-stats-${timeRange}-${timestamp}`;

      if (format === "csv") {
        const csvData = generateCSVData();
        downloadFile(csvData, `${baseFilename}.csv`, "text/csv");
      } else {
        const jsonData = generateJSONData();
        downloadFile(jsonData, `${baseFilename}.json`, "application/json");
      }
    } catch (error) {
      logger.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!data) {
    return (
      <Button variant="outline" disabled>
        <Download className="h-4 w-4 mr-2" />
        {t("admin.analytics.revenue.export")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading || isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting
            ? t("admin.analytics.export.exporting")
            : t("admin.analytics.revenue.export")}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {t("admin.analytics.export.selectFormat")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t("admin.analytics.export.csv")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileText className="h-4 w-4 mr-2" />
          {t("admin.analytics.export.json")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
