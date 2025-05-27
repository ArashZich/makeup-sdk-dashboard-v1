// src/features/admin/plans/views/CreatePlanView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPlans } from "@/api/hooks/usePlans";
import { PlanForm } from "../components/PlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPlanPlatformConfigs } from "@/constants/platform-configs";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";
import { Package, Info, Target, Settings, Zap, Globe } from "lucide-react";

export function CreatePlanView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createPlan, isCreatingPlan } = useAdminPlans();

  // دریافت تنظیمات پلتفرم‌ها برای نمایش راهنما
  const platformConfigs = getPlanPlatformConfigs(t);

  const handleSubmit = async (data: any) => {
    try {
      logger.api("Creating plan with data:", data);
      await createPlan(data);
      logger.success("Plan created successfully");
      showToast.success(t("plans.createSuccess"));
      router.push("/dashboard/admin/plans");
    } catch (error) {
      logger.error("Error creating plan:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center">
        <BackButtonIcon href="/dashboard/admin/plans" />

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Package className="mr-2 h-6 w-6" />
            {t("plans.addPlan")}
          </h1>
          <p className="text-muted-foreground">
            {t("plans.addPlanDescription")}
          </p>
        </div>
      </div>

      {/* راهنمای سریع */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t("plans.createPlanInfo")}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فرم ایجاد پلن */}
        <div className="lg:col-span-2">
          <PlanForm isSubmitting={isCreatingPlan} onSubmit={handleSubmit} />
        </div>

        {/* راهنما و اطلاعات جانبی */}
        <div className="space-y-6">
          {/* راهنمای تب‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("plans.formSections")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("plans.form.general")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("plans.generalSectionDescription")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("plans.form.platforms")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("plans.platformsSectionDescription")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("plans.form.features")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("plans.featuresSectionDescription")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("plans.form.sdkFeatures")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("plans.sdkSectionDescription")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("plans.form.mediaFeatures")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("plans.mediaSectionDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* اطلاعات پلتفرم‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("plans.availablePlatforms")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("plans.platformsInfoDescription")}
              </p>

              <div className="space-y-2">
                {platformConfigs.map((platform) => (
                  <div key={platform.value} className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {platform.icon}
                      {platform.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {platform.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* نکات مهم برای پلن‌ها */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.importantNotes")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("plans.note1")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("plans.note2")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("plans.note3")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-300">
                    {t("plans.unlimitedNote")}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-orange-700 dark:text-orange-300">
                    {t("plans.platformNote")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تنظیمات پیشرفته */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.advancedSettings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("plans.requestLimitTypes")}:
                  </span>
                  <span>2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("plans.supportedPlatforms")}:
                  </span>
                  <span>{platformConfigs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("plans.featureTypes")}:
                  </span>
                  <span>3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* راهنمای سریع */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.quickTips")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <p className="text-blue-700 dark:text-blue-300">
                    💡 {t("plans.tip1")}
                  </p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                  <p className="text-green-700 dark:text-green-300">
                    🎯 {t("plans.tip2")}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    ⚡ {t("plans.tip3")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
