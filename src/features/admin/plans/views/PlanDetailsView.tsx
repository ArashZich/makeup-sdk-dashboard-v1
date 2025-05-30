// src/features/admin/plans/views/PlanDetailsView.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans, useAdminPlans } from "@/api/hooks/usePlans";
import { DeletePlanDialog } from "../components/DeletePlanDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getPlanPlatformConfigs } from "@/constants/platform-configs";
import {
  ArrowLeft,
  Edit,
  Trash,
  Star,
  Calendar,
  DollarSign,
  Check,
  AlertCircle,
  Globe,
  Smartphone,
  Zap,
  Settings,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { useBoolean } from "@/hooks/useBoolean";
import { BackButtonIcon } from "@/components/common/BackButton";

export function PlanDetailsView() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const planId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const { getValue, toggle } = useBoolean({
    showDeleteDialog: false,
  });

  // استفاده از usePlans برای دریافت اطلاعات پلن
  const { getAllPlans } = usePlans();
  const { deletePlan, isDeletingPlan } = useAdminPlans();

  const { data: plans, isLoading, error } = getAllPlans();

  // دریافت تنظیمات پلتفرم‌ها
  const platformConfigs = getPlanPlatformConfigs(t);

  // پیدا کردن پلن مورد نظر
  const plan = plans?.results.find((p) => p._id === planId);

  // تابع فرمت کردن requestLimit
  const formatRequestLimit = (total: number) => {
    if (total === -1) return t("common.unlimited");
    return total.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  // تابع نمایش پلتفرم‌ها
  const renderTargetPlatforms = () => {
    if (!plan) return null;

    if (plan.targetPlatforms.includes("all")) {
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("plans.allPlatforms")}
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {plan.targetPlatforms.map((platform) => {
          const config = platformConfigs.find((p) => p.value === platform);
          return (
            <Badge key={platform} variant="outline" className="gap-2">
              {config?.icon || <Smartphone className="h-4 w-4" />}
              {config?.label || platform}
            </Badge>
          );
        })}
      </div>
    );
  };

  const handleDelete = async () => {
    if (!plan) return;

    try {
      await deletePlan(plan._id);
      router.push("/dashboard/admin/plans");
    } catch (error) {
      logger.error("Error deleting plan:", error);
    }
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
      {/* هدر */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/admin/plans")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
              {plan.specialOffer && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  <Star className="mr-1 h-3 w-3" /> {t("plans.specialOffer")}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {plan.active ? (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500"
                >
                  {t("plans.active")}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  {t("plans.inactive")}
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/admin/plans/edit/${plan._id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => toggle("showDeleteDialog")}
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* اطلاعات اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {t("plans.price")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(plan.price, isRtl ? "fa-IR" : "en-US")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {t("plans.duration")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {t("plans.durationDays", { days: plan.duration })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              {t("plans.totalRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatRequestLimit(plan.requestLimit.total)}
            </p>
            {plan.requestLimit.total === -1 && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 mt-2"
              >
                {t("common.unlimited")}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* توضیحات و ویژگی‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("plans.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{plan.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("plans.features")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.length > 0 ? (
                plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  {t("plans.noFeatures")}
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* پلتفرم‌های پشتیبانی شده */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("plans.targetPlatforms")}
          </CardTitle>
          <CardDescription>
            {t("plans.targetPlatformsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTargetPlatforms()}

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              {plan.targetPlatforms.includes("all")
                ? t("plans.availableOnAllPlatforms")
                : t("plans.availableOnSpecificPlatforms", {
                    count: plan.targetPlatforms.length,
                  })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ویژگی‌های SDK */}
      <Card>
        <CardHeader>
          <CardTitle>{t("plans.sdkFeatures")}</CardTitle>
          <CardDescription>{t("plans.sdkFeaturesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t("plans.enabledFeatures")}
              </h3>
              <ul className="space-y-2">
                {plan.defaultSdkFeatures.features.length > 0 ? (
                  plan.defaultSdkFeatures.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">
                    {t("plans.noSdkFeatures")}
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                {t("plans.patterns")}
              </h3>
              {Object.keys(plan.defaultSdkFeatures.patterns).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(plan.defaultSdkFeatures.patterns).map(
                    ([key, values]) => (
                      <div key={key} className="border rounded-md p-3">
                        <h4 className="font-medium mb-2">{key}</h4>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value, index) => (
                            <Badge key={index} variant="outline">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("plans.noPatterns")}</p>
              )}
            </div>
          </div>

          {plan.defaultSdkFeatures.mediaFeatures && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                {t("plans.mediaFeatures")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">
                    {t("plans.allowedSources")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.defaultSdkFeatures.mediaFeatures.allowedSources
                      ?.length > 0 ? (
                      plan.defaultSdkFeatures.mediaFeatures.allowedSources.map(
                        (source, index) => (
                          <Badge key={index} variant="outline">
                            {source}
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        {t("plans.noSources")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {t("plans.allowedViews")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.defaultSdkFeatures.mediaFeatures.allowedViews
                      ?.length > 0 ? (
                      plan.defaultSdkFeatures.mediaFeatures.allowedViews.map(
                        (view, index) => (
                          <Badge key={index} variant="outline">
                            {view}
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        {t("plans.noViews")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {t("plans.comparisonModes")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.defaultSdkFeatures.mediaFeatures.comparisonModes
                      ?.length > 0 ? (
                      plan.defaultSdkFeatures.mediaFeatures.comparisonModes.map(
                        (mode, index) => (
                          <Badge key={index} variant="outline">
                            {mode}
                          </Badge>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        {t("plans.noModes")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* دیالوگ حذف */}
      <DeletePlanDialog
        plan={plan}
        isOpen={getValue("showDeleteDialog")}
        isDeleting={isDeletingPlan}
        onConfirm={handleDelete}
        onCancel={() => toggle("showDeleteDialog")}
      />
    </div>
  );
}
