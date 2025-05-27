// src/features/admin/plans/views/PlansView.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans, useAdminPlans } from "@/api/hooks/usePlans";
import { Plan, PlanFilters, TargetPlatform } from "@/api/types/plans.types";
import { DeletePlanDialog } from "../components/DeletePlanDialog";
import { PlanTable } from "../components/PlanTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPlanPlatformConfigs } from "@/constants/platform-configs";
import {
  PlusCircle,
  Package,
  AlertCircle,
  Filter,
  BarChart3,
  Globe,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { logger } from "@/lib/logger";

export function PlansView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [filters, setFilters] = useState<PlanFilters>({});
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<
    TargetPlatform | "all"
  >("all");

  const { getAllPlans } = usePlans();
  const { deletePlan, isDeletingPlan } = useAdminPlans();

  const { data: plans, isLoading, error, refetch } = getAllPlans(filters);

  // دریافت تنظیمات پلتفرم‌ها
  const platformConfigs = getPlanPlatformConfigs(t);

  // پردازش و فیلتر کردن پلن‌ها
  const processedPlans = useMemo(() => {
    if (!plans?.results) return null;

    const allPlans = plans.results;

    // فیلتر بر اساس پلتفرم انتخاب شده
    let filteredPlans = allPlans;
    if (selectedPlatform !== "all") {
      filteredPlans = allPlans.filter(
        (plan) =>
          plan.targetPlatforms.includes("all") ||
          plan.targetPlatforms.includes(selectedPlatform)
      );
    }

    // آمار پلتفرم‌ها
    const platformStats = platformConfigs.reduce((acc, config) => {
      const count = allPlans.filter(
        (plan) =>
          plan.targetPlatforms.includes("all") ||
          plan.targetPlatforms.includes(config.value)
      ).length;
      acc[config.value] = count;
      return acc;
    }, {} as Record<TargetPlatform, number>);

    // آمار کلی
    const stats = {
      total: allPlans.length,
      active: allPlans.filter((p) => p.active).length,
      inactive: allPlans.filter((p) => !p.active).length,
      specialOffers: allPlans.filter((p) => p.specialOffer).length,
      platformStats,
    };

    return {
      all: allPlans,
      filtered: filteredPlans,
      stats,
    };
  }, [plans, selectedPlatform, platformConfigs]);

  // رفرش داده‌ها هنگام تغییر فیلترها
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      await deletePlan(planToDelete._id);
      setPlanToDelete(null);
      refetch();
    } catch (error) {
      logger.error("Error deleting plan:", error);
    }
  };

  const handlePlatformFilterChange = (platform: string) => {
    setSelectedPlatform(platform as TargetPlatform | "all");
  };

  // تابع دریافت آیکون پلتفرم
  const getPlatformIcon = (platform: TargetPlatform) => {
    const config = platformConfigs.find((p) => p.value === platform);
    return config?.icon || <Smartphone className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("common.error.title")}</AlertTitle>
        <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Package className="mr-2 h-6 w-6" />
            {t("plans.title")}
          </h1>
          <p className="text-muted-foreground">{t("plans.description")}</p>
        </div>

        <Button onClick={() => router.push("/dashboard/admin/plans/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("plans.addPlan")}
        </Button>
      </div>

      {/* آمار سریع */}
      {processedPlans && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {processedPlans.stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.totalPlans")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {processedPlans.stats.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.activePlans")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {processedPlans.stats.inactive}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.inactivePlans")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {processedPlans.stats.specialOffers}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.specialOffers")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* فیلترها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("common.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t("plans.filterByPlatform")}:
              </span>
              <Select
                value={selectedPlatform}
                onValueChange={handlePlatformFilterChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("plans.selectPlatform")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t("plans.allPlatforms")}
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

            {/* نمایش فیلتر فعال */}
            {selectedPlatform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {getPlatformIcon(selectedPlatform as TargetPlatform)}
                {t(`plans.platforms.${selectedPlatform}`)}
              </Badge>
            )}
          </div>

          {/* نمایش تعداد نتایج */}
          {processedPlans && (
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedPlatform === "all"
                ? t("plans.showingAllPlans", {
                    count: processedPlans.filtered.length,
                  })
                : t("plans.showingFilteredPlans", {
                    count: processedPlans.filtered.length,
                    platform: t(`plans.platforms.${selectedPlatform}`),
                  })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* آمار پلتفرم‌ها */}
      {processedPlans && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("plans.platformStatistics")}
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
                    {processedPlans.stats.platformStats[platform.value] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("plans.availablePlans")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* لیست پلن‌ها */}
      {processedPlans && processedPlans.filtered.length > 0 ? (
        <PlanTable
          plans={processedPlans.filtered}
          onDeletePlan={handleDeleteClick}
        />
      ) : processedPlans ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {selectedPlatform === "all"
              ? t("plans.noPlans")
              : t("plans.noPlatformPlans", {
                  platform: t(`plans.platforms.${selectedPlatform}`),
                })}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedPlatform === "all"
              ? t("plans.noPlansDescription")
              : t("plans.noPlatformPlansDescription")}
          </p>
          <Button
            onClick={() => router.push("/dashboard/admin/plans/create")}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("plans.addPlan")}
          </Button>
        </div>
      ) : null}

      {/* دیالوگ حذف پلن */}
      <DeletePlanDialog
        plan={planToDelete}
        isOpen={!!planToDelete}
        isDeleting={isDeletingPlan}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
}
