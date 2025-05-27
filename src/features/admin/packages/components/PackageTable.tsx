// src/features/admin/packages/components/PackageTable.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Package } from "@/api/types/packages.types";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { getPackagePlatformConfigs } from "@/constants/platform-configs";
import { MoreHorizontal, Eye, Pause, Play, Calendar, Zap } from "lucide-react";

interface PackageTableProps {
  packages: Package[];
  isLoading?: boolean;
  onViewDetails: (packageId: string) => void;
  onExtend: (packageId: string) => void;
  onSuspend: (packageId: string) => void;
  onReactivate: (packageId: string) => void;
}

export function PackageTable({
  packages,
  isLoading = false,
  onViewDetails,
  onExtend,
  onSuspend,
  onReactivate,
}: PackageTableProps) {
  const { t, isRtl } = useLanguage();

  // دریافت تنظیمات پلتفرم‌ها
  const platformConfigs = getPackagePlatformConfigs(t);

  // Helper function برای نمایش مقادیر نامحدود
  const formatLimitValue = (value: number) => {
    if (value === -1) return t("common.unlimited");
    return value.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  // تابع نمایش پلتفرم
  const renderPlatform = (platform: string) => {
    const config = platformConfigs.find((p) => p.value === platform);
    if (config) {
      return (
        <Badge variant="outline" className={`gap-1 ${config.color}`}>
          {config.icon}
          {config.label}
        </Badge>
      );
    }
    return <Badge variant="outline">{platform}</Badge>;
  };

  const columns: ColumnDef<Package>[] = [
    {
      accessorKey: "userId",
      header: t("admin.users.title"),
      cell: ({ row }) => {
        const user = row.original.userId;
        return typeof user === "object" ? user.name : user;
      },
    },
    {
      accessorKey: "planId",
      header: t("plans.title"),
      cell: ({ row }) => {
        const plan = row.original.planId;
        return typeof plan === "object" ? plan.name : t("packages.unknownPlan");
      },
    },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "expired"
                ? "destructive"
                : "secondary"
            }
          >
            {t(`packages.status.${status}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchasePlatform",
      header: t("admin.packages.purchasePlatform"),
      cell: ({ row }) => renderPlatform(row.original.purchasePlatform),
    },
    {
      accessorKey: "startDate",
      header: t("packages.startDate"),
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: t("packages.endDate"),
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: "requestLimit",
      header: () => (
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4" />
          {t("admin.packages.requestLimit")}
        </div>
      ),
      cell: ({ row }) => {
        const limit = row.original.requestLimit;
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">
                {t("admin.packages.total")}:
              </span>
              <span className="font-medium">
                {formatLimitValue(limit.total)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">
                {t("admin.packages.remaining")}:
              </span>
              <span className="font-medium">
                {formatLimitValue(limit.remaining)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => {
        const packageData = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(packageData._id)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("admin.packages.viewDetails")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onExtend(packageData._id)}>
                <Calendar className="mr-2 h-4 w-4" />
                {t("admin.packages.extendPackage")}
              </DropdownMenuItem>

              {packageData.status === "active" ? (
                <DropdownMenuItem onClick={() => onSuspend(packageData._id)}>
                  <Pause className="mr-2 h-4 w-4" />
                  {t("admin.packages.suspendPackage")}
                </DropdownMenuItem>
              ) : packageData.status === "suspended" ? (
                <DropdownMenuItem onClick={() => onReactivate(packageData._id)}>
                  <Play className="mr-2 h-4 w-4" />
                  {t("admin.packages.reactivatePackage")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={packages}
      searchKey="userId"
      searchPlaceholder={t("admin.packages.searchPlaceholder")}
      noResultsText={t("admin.packages.noPackages")}
    />
  );
}
