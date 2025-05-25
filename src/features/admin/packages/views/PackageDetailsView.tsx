// src/features/admin/packages/views/PackageDetailsView.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBoolean } from "@/hooks/useBoolean";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { ExtendPackageDialog } from "../components/ExtendPackageDialog";
import { SuspendPackageDialog } from "../components/SuspendPackageDialog";
import { BackButtonIcon } from "@/components/common/BackButton";
import { Calendar, Pause, Play } from "lucide-react";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { ExtendPackageRequest } from "@/api/types/packages.types";
import logger from "@/lib/logger";

export function PackageDetailsView() {
  const { t } = useLanguage();
  const params = useParams();
  const packageId = params.id as string;

  // ✅ استفاده از useBoolean به جای state های جداگانه
  const { getValue, setTrue, setFalse, setValue } = useBoolean({
    showExtendDialog: false,
    showSuspendDialog: false,
  });

  // ✅ Helper function برای نمایش مقادیر نامحدود
  const formatLimitValue = (value: number) => {
    return value === -1 ? t("common.unlimited") : value.toLocaleString("fa-IR");
  };

  // State برای نوع عملیات suspend/reactivate
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">(
    "suspend"
  );

  // دریافت اطلاعات بسته
  const { getAllPackages } = useAdminPackages();
  const { data: packagesData } = getAllPackages();
  const packageData = packagesData?.results.find((p) => p._id === packageId);

  // عملیات‌های بسته
  const {
    extendPackage,
    suspendPackage,
    reactivatePackage,
    isExtendingPackage,
    isSuspendingPackage,
    isReactivatingPackage,
  } = useAdminPackages();

  // ✅ مدیریت تمدید بسته
  const handleExtendConfirm = async (data: ExtendPackageRequest) => {
    try {
      logger.api("Extending package:", packageId, "with data:", data);
      await extendPackage({ packageId, data });
      logger.success("Package extended successfully");
      setFalse("showExtendDialog");
    } catch (error) {
      logger.fail("Error extending package:", error);
    }
  };

  // ✅ مدیریت تعلیق بسته
  const handleSuspend = () => {
    logger.api("Opening suspend dialog for package:", packageId);
    setSuspendAction("suspend");
    setTrue("showSuspendDialog");
  };

  // ✅ مدیریت فعال‌سازی بسته
  const handleReactivate = () => {
    logger.api("Opening reactivate dialog for package:", packageId);
    setSuspendAction("reactivate");
    setTrue("showSuspendDialog");
  };

  // ✅ تایید تعلیق/فعال‌سازی
  const handleSuspendConfirm = async () => {
    try {
      logger.api(`${suspendAction} package:`, packageId);

      if (suspendAction === "suspend") {
        await suspendPackage(packageId);
        logger.success("Package suspended successfully");
      } else {
        await reactivatePackage(packageId);
        logger.success("Package reactivated successfully");
      }

      setFalse("showSuspendDialog");
    } catch (error) {
      logger.fail("Error updating package status:", error);
    }
  };

  // ✅ باز کردن دیالوگ تمدید
  const handleOpenExtendDialog = () => {
    logger.api("Opening extend dialog for package:", packageId);
    setTrue("showExtendDialog");
  };

  if (!packageData) {
    return (
      <div className="text-center py-8">
        <p>{t("packages.error.packageNotFound")}</p>
      </div>
    );
  }

  const user =
    typeof packageData.userId === "object" ? packageData.userId : null;
  const plan =
    typeof packageData.planId === "object" ? packageData.planId : null;

  // ✅ محاسبه درصد استفاده با در نظر گیری unlimited
  const usagePercent =
    packageData.requestLimit.monthly > 0 &&
    packageData.requestLimit.monthly !== -1
      ? Math.round(
          ((packageData.requestLimit.monthly -
            packageData.requestLimit.remaining) /
            packageData.requestLimit.monthly) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* ✅ استفاده از BackButtonIcon */}
          <BackButtonIcon href="/dashboard/admin/packages" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("packages.packageDetails")}
            </h1>
            <p className="text-muted-foreground">
              {user?.name} - {plan?.name}
            </p>
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" onClick={handleOpenExtendDialog}>
            <Calendar className="mr-2 h-4 w-4" />
            {t("admin.packages.extendPackage")}
          </Button>

          {packageData.status === "active" ? (
            <Button variant="destructive" onClick={handleSuspend}>
              <Pause className="mr-2 h-4 w-4" />
              {t("admin.packages.suspendPackage")}
            </Button>
          ) : packageData.status === "suspended" ? (
            <Button variant="default" onClick={handleReactivate}>
              <Play className="mr-2 h-4 w-4" />
              {t("admin.packages.reactivatePackage")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* اطلاعات کلی */}
        <Card>
          <CardHeader>
            <CardTitle>{t("common.generalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("common.status")}
              </span>
              <Badge
                variant={
                  packageData.status === "active"
                    ? "default"
                    : packageData.status === "expired"
                    ? "destructive"
                    : "secondary"
                }
              >
                {t(`packages.status.${packageData.status}`)}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("admin.packages.purchasePlatform")}
              </span>
              <Badge variant="outline">
                {t(
                  `admin.packages.platformLabels.${packageData.purchasePlatform}`
                )}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("packages.startDate")}
              </span>
              <span>{formatDate(packageData.startDate)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("packages.endDate")}
              </span>
              <span>{formatDate(packageData.endDate)}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("packages.packageId")}
              </span>
              <span className="text-sm font-mono">{packageData._id}</span>
            </div>
          </CardContent>
        </Card>

        {/* محدودیت درخواست‌ها */}
        <Card>
          <CardHeader>
            <CardTitle>{t("packages.requestLimits")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("admin.packages.monthlyLimit")}
              </span>
              <span>
                {formatLimitValue(packageData.requestLimit.monthly)}{" "}
                {/* ✅ استفاده از helper function */}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("admin.packages.remainingRequests")}
              </span>
              <span>
                {formatLimitValue(packageData.requestLimit.remaining)}{" "}
                {/* ✅ استفاده از helper function */}
              </span>
            </div>

            <Separator />

            {/* ✅ نمایش درصد استفاده فقط برای محدود */}
            {packageData.requestLimit.monthly !== -1 && (
              <div className="text-sm text-muted-foreground">
                {t("packages.usageProgress")}: {usagePercent}%
              </div>
            )}
          </CardContent>
        </Card>

        {/* اطلاعات کاربر */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("common.name")}
                </span>
                <span>{user.name}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("common.phone")}
                </span>
                <span>{user.phone}</span>
              </div>

              {user.email && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("common.email")}
                    </span>
                    <span>{user.email}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* اطلاعات پلن */}
        {plan && (
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("common.name")}
                </span>
                <span>{plan.name}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("plans.price")}
                </span>
                <span>{formatCurrency(plan.price)}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("common.duration")}
                </span>
                <span>
                  {plan.duration} {t("common.days")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ✅ دیالوگ تمدید بسته - با useBoolean */}
      <ExtendPackageDialog
        open={getValue("showExtendDialog")}
        onOpenChange={(open) => setValue("showExtendDialog", open)}
        onConfirm={handleExtendConfirm}
        isLoading={isExtendingPackage}
        packageId={packageId}
      />

      {/* ✅ دیالوگ تعلیق/فعال‌سازی بسته - با useBoolean */}
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
