// src/features/packages/views/PackagesListView.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserPackages } from "@/api/hooks/usePackages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookies } from "@/lib/cookies";
import { PackageCard } from "../components/PackageCard";
import { PackageStatus, PurchasePlatform } from "@/api/types/packages.types";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InfoIcon,
  Package as PackageIcon,
  TimerIcon,
  ShoppingBag,
  Globe,
  ExternalLink,
  Smartphone,
  Filter,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterType = "status" | "platform";

export function PackagesListView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { getCookie } = useCookies();
  const [activeTab, setActiveTab] = useState<string>("active");
  const [filterType, setFilterType] = useState<FilterType>("status");

  // Hook to get user packages
  const {
    getUserPackages,
    filterPackagesByPlatform,
    groupPackagesByPlatform,
    getPackageStatsByPlatform,
  } = useUserPackages();

  // Get all user packages
  const { data: allPackages, isLoading, error } = getUserPackages();

  // تشخیص پلتفرم کاربر
  const userPlatform: PurchasePlatform = useMemo(() => {
    const userRole = getCookie("user_role");
    const divarToken = getCookie("divar_token");

    if (divarToken) return "divar";
    if (userRole === "divar_user") return "divar";
    return "normal";
  }, [getCookie]);

  // پردازش داده‌های بسته‌ها
  const processedPackages = useMemo(() => {
    if (!allPackages?.results) return null;

    const packages = allPackages.results;

    // گروه‌بندی بر اساس status
    const byStatus = {
      active: packages.filter((pkg) => pkg.status === "active"),
      expired: packages.filter((pkg) => pkg.status === "expired"),
      suspended: packages.filter((pkg) => pkg.status === "suspended"),
    };

    // گروه‌بندی بر اساس platform
    const byPlatform = groupPackagesByPlatform(packages);

    // آمار پلتفرم‌ها
    const platformStats = getPackageStatsByPlatform(packages);

    return {
      all: packages,
      byStatus,
      byPlatform,
      platformStats,
      totalCount: packages.length,
    };
  }, [allPackages, groupPackagesByPlatform, getPackageStatsByPlatform]);

  // تابع فیلتر کردن بسته‌ها
  const getFilteredPackages = () => {
    if (!processedPackages) return [];

    if (filterType === "status") {
      return (
        processedPackages.byStatus[
          activeTab as keyof typeof processedPackages.byStatus
        ] || []
      );
    } else {
      return processedPackages.byPlatform[activeTab as PurchasePlatform] || [];
    }
  };

  const filteredPackages = getFilteredPackages();

  const handleViewPackage = (packageId: string) => {
    router.push(`/dashboard/packages/${packageId}`);
  };

  const handleBuyPackage = () => {
    router.push("/dashboard/plans");
  };

  // تابع نمایش آیکون پلتفرم
  const getPlatformIcon = (platform: PurchasePlatform) => {
    switch (platform) {
      case "normal":
        return <Globe className="h-4 w-4" />;
      case "divar":
        return <ExternalLink className="h-4 w-4" />;
      case "torob":
      case "basalam":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("packages.error.title")}</AlertTitle>
        <AlertDescription>{t("packages.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("packages.title")}
          </h1>
          <p className="text-muted-foreground">{t("packages.description")}</p>

          {/* نمایش آمار کلی */}
          {processedPackages && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {processedPackages.totalCount} {t("packages.totalPackages")}
              </Badge>
              <Badge variant="secondary">
                {t("packages.yourPlatform")}:{" "}
                {t(`packages.platforms.${userPlatform}`)}
              </Badge>
            </div>
          )}
        </div>

        <Button onClick={handleBuyPackage}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          {t("plans.buyPlan")}
        </Button>
      </div>

      {/* آمار سریع */}
      {processedPackages && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {processedPackages.byStatus.active.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("packages.status.active")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {processedPackages.byStatus.expired.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("packages.status.expired")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {processedPackages.byStatus.suspended.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("packages.status.suspended")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {
                  Object.keys(processedPackages.byPlatform).filter(
                    (platform) =>
                      processedPackages.byPlatform[platform as PurchasePlatform]
                        .length > 0
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {t("packages.activePlatforms")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* انتخاب نوع فیلتر */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("packages.filterBy")}:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "status" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("status");
              setActiveTab("active");
            }}
          >
            {t("packages.filterByStatus")}
          </Button>
          <Button
            variant={filterType === "platform" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterType("platform");
              setActiveTab("normal");
            }}
          >
            {t("packages.filterByPlatform")}
          </Button>
        </div>
      </div>

      {/* تب‌ها */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* تب‌های فیلتر بر اساس وضعیت */}
        {filterType === "status" && (
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4" />
              {t("packages.tabs.active")}
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <TimerIcon className="h-4 w-4" />
              {t("packages.tabs.expired")}
            </TabsTrigger>
            <TabsTrigger value="suspended" className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              {t("packages.tabs.suspended")}
            </TabsTrigger>
          </TabsList>
        )}

        {/* تب‌های فیلتر بر اساس پلتفرم */}
        {filterType === "platform" && (
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="normal" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {t("packages.platforms.normal")}
            </TabsTrigger>
            <TabsTrigger value="divar" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              {t("packages.platforms.divar")}
            </TabsTrigger>
            <TabsTrigger value="torob" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              {t("packages.platforms.torob")}
            </TabsTrigger>
            <TabsTrigger value="basalam" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              {t("packages.platforms.basalam")}
            </TabsTrigger>
          </TabsList>
        )}

        {/* محتوای تب‌ها */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredPackages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  package={pkg}
                  onView={handleViewPackage}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  {filterType === "status" ? (
                    <>
                      {activeTab === "active" && (
                        <PackageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                      {activeTab === "expired" && (
                        <TimerIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                      {activeTab === "suspended" && (
                        <InfoIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </>
                  ) : (
                    getPlatformIcon(activeTab as PurchasePlatform)
                  )}

                  {filterType === "status"
                    ? t(
                        `packages.no${
                          activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                        }Packages`
                      )
                    : t("packages.noPlatformPackages", {
                        platform: t(`packages.platforms.${activeTab}`),
                      })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  {filterType === "status" &&
                    activeTab === "active" &&
                    t("packages.noActivePackagesDescription")}
                  {filterType === "platform" &&
                    t("packages.noPlatformPackagesDescription", {
                      platform: t(`packages.platforms.${activeTab}`),
                    })}
                </p>
                {filterType === "status" && activeTab === "active" && (
                  <Button onClick={handleBuyPackage}>
                    {t("plans.buyPlan")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* آمار پلتفرم‌ها */}
      {processedPackages && filterType === "status" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("packages.platformStats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(processedPackages.platformStats).map(
                ([platform, stats]) => (
                  <div key={platform} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getPlatformIcon(platform as PurchasePlatform)}
                      <span className="text-sm font-medium">
                        {t(`packages.platforms.${platform}`)}
                      </span>
                    </div>
                    <div className="text-lg font-bold">{stats.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.active} {t("packages.active")} | {stats.expired}{" "}
                      {t("packages.expired")}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
