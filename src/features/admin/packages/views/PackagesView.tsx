// src/features/admin/packages/views/PackagesView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { useBoolean } from "@/hooks/useBoolean"; // ✅ اضافه کردن import
import { PackageTable } from "../components/PackageTable";
import { ExtendPackageDialog } from "../components/ExtendPackageDialog";
import { SuspendPackageDialog } from "../components/SuspendPackageDialog";
import { Plus } from "lucide-react";
import { ExtendPackageRequest } from "@/api/types/packages.types";
import { logger } from "@/lib/logger";

export function PackagesView() {
  const { t } = useLanguage();
  const router = useRouter();

  // ✅ استفاده از useBoolean برای تمام state های boolean
  const { getValue, setTrue, setFalse, setValue } = useBoolean({
    showExtendDialog: false,
    showSuspendDialog: false,
  });

  // State برای ID بسته انتخاب شده و نوع عملیات
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">(
    "suspend"
  );

  // دریافت بسته‌ها
  const { getAllPackages } = useAdminPackages();
  const { data: packagesData, isLoading } = getAllPackages();

  // عملیات‌های بسته
  const {
    extendPackage,
    suspendPackage,
    reactivatePackage,
    isExtendingPackage,
    isSuspendingPackage,
    isReactivatingPackage,
  } = useAdminPackages();

  // مدیریت نمایش جزئیات
  const handleViewDetails = (packageId: string) => {
    router.push(`/dashboard/admin/packages/${packageId}`);
  };

  // مدیریت تمدید بسته
  const handleExtend = (packageId: string) => {
    setSelectedPackageId(packageId);
    setTrue("showExtendDialog"); // ✅ استفاده از setTrue
  };

  const handleExtendConfirm = async (data: ExtendPackageRequest) => {
    try {
      await extendPackage({ packageId: selectedPackageId, data });
      setFalse("showExtendDialog"); // ✅ استفاده از setFalse
      setSelectedPackageId("");
    } catch (error) {
      logger.error("Error extending package:", error);
    }
  };

  // مدیریت تعلیق بسته
  const handleSuspend = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("suspend");
    setTrue("showSuspendDialog"); // ✅ استفاده از setTrue
  };

  // مدیریت فعال‌سازی مجدد بسته
  const handleReactivate = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("reactivate");
    setTrue("showSuspendDialog"); // ✅ استفاده از setTrue
  };

  const handleSuspendConfirm = async () => {
    try {
      if (suspendAction === "suspend") {
        await suspendPackage(selectedPackageId);
      } else {
        await reactivatePackage(selectedPackageId);
      }
      setFalse("showSuspendDialog"); // ✅ استفاده از setFalse
      setSelectedPackageId("");
    } catch (error) {
      logger.error("Error updating package status:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
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

      {/* جدول بسته‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.packages.title")}</CardTitle>
          <CardDescription>
            {packagesData?.totalResults || 0} {t("common.entries")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackageTable
            packages={packagesData?.results || []}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onExtend={handleExtend}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
          />
        </CardContent>
      </Card>

      {/* دیالوگ تمدید بسته */}
      <ExtendPackageDialog
        open={getValue("showExtendDialog")} // ✅ استفاده از getValue
        onOpenChange={(open) => setValue("showExtendDialog", open)} // ✅ استفاده از setValue برای مدیریت وضعیت
        onConfirm={handleExtendConfirm}
        isLoading={isExtendingPackage}
        packageId={selectedPackageId}
      />

      {/* دیالوگ تعلیق/فعال‌سازی بسته */}
      <SuspendPackageDialog
        open={getValue("showSuspendDialog")} // ✅ استفاده از getValue
        onOpenChange={(open) => setValue("showSuspendDialog", open)} // ✅ استفاده از setValue برای مدیریت وضعیت
        onConfirm={handleSuspendConfirm}
        isLoading={isSuspendingPackage || isReactivatingPackage}
        action={suspendAction}
      />
    </div>
  );
}
