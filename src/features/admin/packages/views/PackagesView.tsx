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
import { PackageTable } from "../components/PackageTable";
import { ExtendPackageDialog } from "../components/ExtendPackageDialog";
import { SuspendPackageDialog } from "../components/SuspendPackageDialog";
import { Plus } from "lucide-react";
import { showToast } from "@/lib/toast";
import { ExtendPackageRequest } from "@/api/types/packages.types";

export function PackagesView() {
  const { t } = useLanguage();
  const router = useRouter();

  // State مدیریت دیالوگ‌ها
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
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
    setShowExtendDialog(true);
  };

  const handleExtendConfirm = async (data: ExtendPackageRequest) => {
    try {
      await extendPackage({ packageId: selectedPackageId, data });
      setShowExtendDialog(false);
      setSelectedPackageId("");
    } catch (error) {
      console.error("Error extending package:", error);
    }
  };

  // مدیریت تعلیق بسته
  const handleSuspend = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("suspend");
    setShowSuspendDialog(true);
  };

  // مدیریت فعال‌سازی مجدد بسته
  const handleReactivate = (packageId: string) => {
    setSelectedPackageId(packageId);
    setSuspendAction("reactivate");
    setShowSuspendDialog(true);
  };

  const handleSuspendConfirm = async () => {
    try {
      if (suspendAction === "suspend") {
        await suspendPackage(selectedPackageId);
      } else {
        await reactivatePackage(selectedPackageId);
      }
      setShowSuspendDialog(false);
      setSelectedPackageId("");
    } catch (error) {
      console.error("Error updating package status:", error);
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
        open={showExtendDialog}
        onOpenChange={setShowExtendDialog}
        onConfirm={handleExtendConfirm}
        isLoading={isExtendingPackage}
        packageId={selectedPackageId}
      />

      {/* دیالوگ تعلیق/فعال‌سازی بسته */}
      <SuspendPackageDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        onConfirm={handleSuspendConfirm}
        isLoading={isSuspendingPackage || isReactivatingPackage}
        action={suspendAction}
      />
    </div>
  );
}
