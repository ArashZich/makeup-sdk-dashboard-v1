// src/features/sdk/views/SdkDashboardView.tsx
"use client";

import { useState } from "react";
import { useUserPackages } from "@/api/hooks/usePackages";
import { useSdk } from "@/api/hooks/useSdk";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, ArrowUpRight } from "lucide-react";
import { SdkTokenCard } from "../components/SdkTokenCard";
import { SdkFeaturesCard } from "../components/SdkFeaturesCard";
import { SdkStatsCard } from "../components/SdkStatsCard";
import { SdkIntegrationCard } from "../components/SdkIntegrationCard";

export function SdkDashboardView() {
  const { t } = useLanguage();
  const { getUserPackages } = useUserPackages();

  // دریافت بسته‌های فعال کاربر
  const { data: packagesData, isLoading: isLoadingPackages } =
    getUserPackages("active");

  // تغییر: استفاده از results
  const activePackages = packagesData?.results || [];

  // بسته فعال اول را استفاده می‌کنیم
  const activePackage = activePackages.length > 0 ? activePackages[0] : null;

  // استفاده از توکن SDK برای دریافت اطلاعات SDK
  const { status, isLoadingStatus, statusError, refetchStatus } = useSdk(
    activePackage?.token
  );

  if (isLoadingPackages || isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (!activePackage) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("sdk.noActivePackage")}</AlertTitle>
        <AlertDescription>
          {t("sdk.noActivePackageDescription")}
        </AlertDescription>
        <div className="mt-4">
          <Button onClick={() => (window.location.href = "/dashboard/plans")}>
            {t("plans.viewAllPlans")}
          </Button>
        </div>
      </Alert>
    );
  }

  if (statusError || !status) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("sdk.error.title")}</AlertTitle>
        <AlertDescription>{t("sdk.error.fetchFailed")}</AlertDescription>
        <div className="mt-4">
          <Button variant="outline" onClick={() => refetchStatus()}>
            {t("common.retry")}
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("sdk.title")}
          </h1>
          <p className="text-muted-foreground">{t("sdk.description")}</p>
        </div>
        <Button>
          <a
            href="https://cdn.makeup.armogroup.tech/makeup/guide"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            {t("sdk.viewDocumentation")}
          </a>
        </Button>
      </div>

      {/* کارت توکن SDK */}
      <SdkTokenCard token={activePackage.token} packageId={activePackage._id} />

      {/* کارت آمار SDK */}
      <SdkStatsCard status={status} />

      {/* کارت ویژگی‌های SDK */}
      <SdkFeaturesCard sdkFeatures={activePackage.sdkFeatures} />

      {/* کارت یکپارچه‌سازی SDK */}
      <SdkIntegrationCard token={activePackage.token} />
    </div>
  );
}
