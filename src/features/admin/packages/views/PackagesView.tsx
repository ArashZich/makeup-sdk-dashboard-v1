// src/features/admin/packages/views/PackagesView.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { useBoolean } from "@/hooks/useBoolean";
import { PackageTable } from "../components/PackageTable";
import { ExtendPackageDialog } from "../components/ExtendPackageDialog";
import { SuspendPackageDialog } from "../components/SuspendPackageDialog";
import { getPackagePlatformConfigs } from "@/constants/platform-configs";
import {
  PackageStatus,
  PurchasePlatform,
  ExtendPackageRequest,
  UpdatePackageLimitsRequest,
} from "@/api/types/packages.types";
import { Plus, Filter, BarChart3, Package, Zap } from "lucide-react";
import { logger } from "@/lib/logger";

export function PackagesView() {
  const { t } = useLanguage();
  const router = useRouter();

  // ✅ استفاده از useBoolean برای تمام state های boolean
  const { getValue, setTrue, setFalse, setValue } = useBoolean({
    showExtendDialog: false,
    showSuspendDialog: false,
  });

  // State برای فیلترها
  const [selectedPlatform, setSelectedPlatform] = useState<
    PurchasePlatform | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus | "all">(
    "all"
  );

  // State برای ID بسته انتخاب شده و نوع عملیات
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">(
    "suspend"
  );

  // دریافت بسته‌ها
  const { getAllPackages } = useAdminPackages();
  const { data: packagesData, isLoading } = getAllPackages();

  // دریافت تنظیمات پلتفرم‌ها
  const platformConfigs = getPackagePlatformConfigs(t);

  // عملیات‌های بسته
  const {
    extendPackage,
    updatePackageLimits,
    suspendPackage,
    reactivatePackage,
    isExtendingPackage,
    isUpdatingPackageLimits,
    isSuspendingPackage,
    isReactivatingPackage,
  } = useAdminPackages();

  // ✅ پردازش و فیلتر کردن بسته‌ها + محاسبه آمار
  const processedPackages = useMemo(() => {
    if (!packagesData?.results) return null;

    const allPackages = packagesData.results;

    // فیلتر بر اساس پلتفرم
    let filteredByPlatform = allPackages;
    if (selectedPlatform !== "all") {
      filteredByPlatform = allPackages.filter(
        (pkg) => pkg.purchasePlatform === selectedPlatform
      );
    }

    // فیلتر بر اساس وضعیت
    let filteredPackages = filteredByPlatform;
    if (selectedStatus !== "all") {
      filteredPackages = filteredByPlatform.filter(
        (pkg) => pkg.status === selectedStatus
      );
    }

    // آمار کلی
    const stats = {
      total: allPackages.length,
      active: allPackages.filter((p) => p.status === "active").length,
      expired: allPackages.filter((p) => p.status === "expired").length,
      suspended: allPackages.filter((p) => p.status === "suspended").length,
    };

    // آمار پلتفرم‌ها
    const platformStats = platformConfigs.reduce((acc, config) => {
      const count = allPackages.filter(
        (pkg) => pkg.purchasePlatform === config.value
      ).length;
      acc[config.value] = count;
      return acc;
    }, {} as Record<PurchasePlatform, number>);

    // آمار استفاده از درخواست‌ها
    const requestStats = {
      unlimited: allPackages.filter((p) => p.requestLimit.total === -1).length,
      almostFinished: allPackages.filter((p) => {
        if (p.requestLimit.total === -1) return false;
        const usagePercent =
          ((p.requestLimit.total - p.requestLimit.remaining) /
            p.requestLimit.total) *
          100;
        return usagePercent > 80;
      }).length,
    };

    return {
      all: allPackages,
      filtered: filteredPackages,
      stats,
      platformStats,
      requestStats,
    };
  }, [packagesData, selectedPlatform, selectedStatus, platformConfigs]);

  // مدیریت نمایش جزئیات
  const handleViewDetails = (packageId: string) => {
    router.push(`/dashboard/admin/packages/${packageId}`);
  };

  // مدیریت تمدید بسته
  const handleExtend = (packageId: string) => {
    setSelectedPackageId(packageId);
    setTrue("showExtendDialog");
  };

  // ✅ مدیریت تمدید روزها (API قدیمی)
  const handleExtendConfirm = async (data: ExtendPackageRequest) => {
    try {
      logger.api(
        "Extending package days:",
        selectedPackageId,
        "with data:",
        data
      );
      await extendPackage({ packageId: selectedPackageId, data });
      logger.success("Package days extended successfully");
      setFalse("showExtendDialog");
      setSelectedPackageId("");
    } catch (error) {
      logger.error("Error extending package:", error);
    }
  };

  // ✅ مدیریت آپدیت محدودیت‌ها (API جدید)
  const handleUpdateLimits = async (data: UpdatePackageLimitsRequest) => {
    try {
      logger.api(
        "Updating package limits:",
        selectedPackageId,
        "with data:",
        data
      );
      await updatePackageLimits({ packageId: selectedPackageId, data });
      logger.success("Package limits updated successfully");
      setFalse("showExtendDialog");
      setSelectedPackageId("");
    } catch (error) {
      logger.error("Error updating package limits:", error);
    }
  };

  // مدیریت تعلیق بسته
  const handleSuspend = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("suspend");
    setTrue("showSuspendDialog");
  };

  // مدیریت فعال‌سازی مجدد بسته
  const handleReactivate = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("reactivate");
    setTrue("showSuspendDialog");
  };

  const handleSuspendConfirm = async () => {
    try {
      if (suspendAction === "suspend") {
        await suspendPackage(selectedPackageId);
      } else {
        await reactivatePackage(selectedPackageId);
      }
      setFalse("showSuspendDialog");
      setSelectedPackageId("");
    } catch (error) {
      logger.error("Error updating package status:", error);
    }
  };

  // تابع تغییر فیلتر پلتفرم
  const handlePlatformFilterChange = (platform: string) => {
    setSelectedPlatform(platform as PurchasePlatform | "all");
  };

  // تابع تغییر فیلتر وضعیت
  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status as PackageStatus | "all");
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Package className="mr-2 h-6 w-6" />
            {t("admin.packages.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.packages.description")}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/packages/create")}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.packages.createPackage")}
        </Button>
      </div>

      {/* ✅ آمار سریع */}
      {processedPackages && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {processedPackages.stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.packages.totalPackages")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {processedPackages.stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.packages.activePackages")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {processedPackages.stats.expired}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.packages.expiredPackages")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {processedPackages.stats.suspended}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("admin.packages.suspendedPackages")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ✅ فیلترها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("common.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* فیلتر پلتفرم */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("admin.packages.filterByPlatform")}:
              </span>
              <Select
                value={selectedPlatform}
                onValueChange={handlePlatformFilterChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue
                    placeholder={t("admin.packages.selectPlatform")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t("admin.packages.allPlatforms")}
                    </div>
                  </SelectItem>
                  {platformConfigs.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        {platform.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* فیلتر وضعیت */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("admin.packages.filterByStatus")}:
              </span>
              <Select
                value={selectedStatus}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t("admin.packages.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.packages.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("packages.status.active")}
                  </SelectItem>
                  <SelectItem value="expired">
                    {t("packages.status.expired")}
                  </SelectItem>
                  <SelectItem value="suspended">
                    {t("packages.status.suspended")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* نمایش فیلترهای فعال */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedPlatform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {
                  platformConfigs.find((p) => p.value === selectedPlatform)
                    ?.icon
                }
                {
                  platformConfigs.find((p) => p.value === selectedPlatform)
                    ?.label
                }
              </Badge>
            )}
            {selectedStatus !== "all" && (
              <Badge variant="secondary">
                {t(`packages.status.${selectedStatus}`)}
              </Badge>
            )}
          </div>

          {/* نمایش تعداد نتایج */}
          {processedPackages && (
            <div className="mt-4 text-sm text-muted-foreground">
              {t("admin.packages.showingResults", {
                count: processedPackages.filtered.length,
                total: processedPackages.all.length,
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ آمار پلتفرم‌ها */}
      {processedPackages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("admin.packages.platformStatistics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platformConfigs.map((platform) => (
                <div key={platform.value} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {platform.icon}
                    <span className="text-sm font-medium">
                      {platform.label}
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {processedPackages.platformStats[platform.value] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("admin.packages.packages")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ آمار درخواست‌ها */}
      {processedPackages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t("admin.packages.requestStatistics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {processedPackages.requestStats.unlimited}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("admin.packages.unlimitedPackages")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {processedPackages.requestStats.almostFinished}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("admin.packages.almostFinishedPackages")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول بسته‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.packages.title")}</CardTitle>
          <CardDescription>
            {processedPackages?.filtered.length || 0} {t("common.entries")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedPackages && processedPackages.filtered.length > 0 ? (
            <PackageTable
              packages={processedPackages.filtered}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onExtend={handleExtend}
              onSuspend={handleSuspend}
              onReactivate={handleReactivate}
            />
          ) : processedPackages ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("admin.packages.noPackagesFound")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("admin.packages.noPackagesDescription")}
              </p>
              <Button
                onClick={() => router.push("/dashboard/admin/packages/create")}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.packages.createPackage")}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ✅ دیالوگ تمدید بسته - آپدیت شده */}
      <ExtendPackageDialog
        open={getValue("showExtendDialog")}
        onOpenChange={(open) => setValue("showExtendDialog", open)}
        onExtendDays={handleExtendConfirm}
        onUpdateLimits={handleUpdateLimits}
        isLoadingExtend={isExtendingPackage}
        isLoadingUpdate={isUpdatingPackageLimits}
        packageId={selectedPackageId}
      />

      {/* ✅ دیالوگ تعلیق/فعال‌سازی بسته */}
      <SuspendPackageDialog
        open={getValue("showSuspendDialog")}
        onOpenChange={(open) => setValue("showSuspendDialog", open)}
        onConfirm={handleSuspendConfirm}
        isLoading={isSuspendingPackage || isReactivatingPackage}
        action={suspendAction}
      />
    </div>
  );
}
