// src/features/admin/plans/views/EditPlanView.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans, useAdminPlans } from "@/api/hooks/usePlans";
import { PlanForm } from "../components/PlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/Loader";
import { getPlanPlatformConfigs } from "@/constants/platform-configs";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";
import {
  Package,
  AlertCircle,
  Info,
  Edit,
  Target,
  Settings,
  Zap,
  Globe,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";

export function EditPlanView() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const planId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  // اگر planId خالی باشد، به صفحه لیست پلن‌ها برگردیم
  if (!planId) {
    router.push("/dashboard/admin/plans");
    return null;
  }

  const { getAllPlans } = usePlans();
  const { updatePlan, isUpdatingPlan } = useAdminPlans();

  const { data: plans, isLoading, error } = getAllPlans();

  // دریافت تنظیمات پلتفرم‌ها برای نمایش راهنما
  const platformConfigs = getPlanPlatformConfigs(t);

  // پیدا کردن پلن فعلی از لیست پلن‌ها
  const plan = plans?.results.find((p) => p._id === planId);

  const handleSubmit = async (data: any) => {
    try {
      logger.api("Updating plan:", planId, "with data:", data);
      await updatePlan({ planId, data });
      logger.success("Plan updated successfully");
      showToast.success(t("plans.updateSuccess"));
      router.push(`/dashboard/admin/plans`);
    } catch (error) {
      logger.error("Error updating plan:", error);
    }
  };

  // ✅ تابع نمایش پلتفرم‌های فعلی
  const renderCurrentPlatforms = () => {
    if (!plan) return null;

    if (plan.targetPlatforms.includes("all")) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" />
          {t("plans.allPlatforms")}
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {plan.targetPlatforms.slice(0, 3).map((platform) => {
          const config = platformConfigs.find((p) => p.value === platform);
          return (
            <Badge key={platform} variant="outline" className="gap-1 text-xs">
              {config?.icon}
              {config?.label}
            </Badge>
          );
        })}
        {plan.targetPlatforms.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{plan.targetPlatforms.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  // ✅ Helper function برای فرمت کردن requestLimit
  const formatRequestLimit = (total: number) => {
    if (total === -1) return t("common.unlimited");
    return total.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("common.error.title")}</AlertTitle>
        <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>
        <BackButtonIcon href="/dashboard/admin/plans" />
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center">
        <BackButtonIcon href="/dashboard/admin/plans" />

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Edit className="mr-2 h-6 w-6" />
            {t("plans.editPlan")}
          </h1>
          <p className="text-muted-foreground">
            {t("plans.editPlanDescription")}
          </p>
        </div>
      </div>

      {/* اطلاعات فعلی پلن */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t("plans.editingPlan")}: <strong>{plan.name}</strong>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فرم ویرایش پلن */}
        <div className="lg:col-span-2">
          <PlanForm
            plan={plan}
            isSubmitting={isUpdatingPlan}
            onSubmit={handleSubmit}
          />
        </div>

        {/* اطلاعات فعلی و راهنما */}
        <div className="space-y-6">
          {/* خلاصه پلن فعلی */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("plans.currentPlanInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {t("plans.price")}:
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                    style: "currency",
                    currency: isRtl ? "IRR" : "USD",
                    maximumFractionDigits: 0,
                  }).format(plan.price)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t("plans.duration")}:
                </span>
                <span className="font-medium">
                  {plan.duration} {t("common.days")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {t("plans.totalRequests")}:
                </span>
                <span className="font-medium">
                  {formatRequestLimit(plan.requestLimit.total)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {t("plans.targetPlatforms")}:
                </span>
                <div className="text-left">{renderCurrentPlatforms()}</div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("common.status")}:
                </span>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? t("common.active") : t("common.inactive")}
                </Badge>
              </div>

              {plan.specialOffer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("plans.specialOffer")}:
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    ✨ {t("plans.specialOffer")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* آمار استفاده */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("plans.usageStats")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  ?
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("plans.activeUsers")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("plans.usageStatsNote")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* راهنمای ویرایش */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("plans.editingTips")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <p className="text-blue-700 dark:text-blue-300">
                    💡 {t("plans.editTip1")}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    ⚠️ {t("plans.editTip2")}
                  </p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                  <p className="text-green-700 dark:text-green-300">
                    ✅ {t("plans.editTip3")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* پلتفرم‌های موجود */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("plans.availablePlatforms")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("plans.platformsEditDescription")}
              </p>

              <div className="space-y-2">
                {platformConfigs.map((platform) => (
                  <div key={platform.value} className="flex items-center gap-2">
                    <Badge
                      variant={
                        plan.targetPlatforms.includes(platform.value) ||
                        plan.targetPlatforms.includes("all")
                          ? "default"
                          : "outline"
                      }
                      className="gap-1"
                    >
                      {platform.icon}
                      {platform.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {plan.targetPlatforms.includes(platform.value) ||
                      plan.targetPlatforms.includes("all")
                        ? t("plans.currentlySupported")
                        : t("plans.notSupported")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* نکات مهم ویرایش */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.importantEditNotes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-orange-700 dark:text-orange-300">
                    {t("plans.editWarning1")}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300">
                    {t("plans.editWarning2")}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-blue-700 dark:text-blue-300">
                    {t("plans.editInfo1")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
