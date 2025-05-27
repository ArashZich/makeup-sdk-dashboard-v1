// src/features/admin/packages/views/CreatePackageView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { PackageForm } from "../components/PackageForm";
import { CreatePackageRequest } from "@/api/types/packages.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPackagePlatformConfigs } from "@/constants/platform-configs";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";
import {
  Package,
  Info,
  Users,
  CreditCard,
  Calendar,
  Settings,
} from "lucide-react";

export function CreatePackageView() {
  const { t } = useLanguage();
  const router = useRouter();

  const { createPackage, isCreatingPackage } = useAdminPackages();

  // دریافت تنظیمات پلتفرم‌ها برای نمایش راهنما
  const platformConfigs = getPackagePlatformConfigs(t);

  const handleSubmit = async (data: CreatePackageRequest) => {
    try {
      logger.api("Creating package with data:", data);
      await createPackage(data);
      logger.success("Package created successfully");
      router.push("/dashboard/admin/packages");
    } catch (error) {
      logger.error("Error creating package:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <BackButtonIcon onClick={handleBack} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Package className="mr-2 h-6 w-6" />
            {t("admin.packages.createPackage")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.packages.createPackageDescription")}
          </p>
        </div>
      </div>

      {/* راهنمای سریع */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t("admin.packages.createPackageInfo")}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* فرم ایجاد بسته */}
        <div className="lg:col-span-2">
          <PackageForm onSubmit={handleSubmit} isLoading={isCreatingPackage} />
        </div>

        {/* راهنما و اطلاعات جانبی */}
        <div className="space-y-6">
          {/* راهنمای مراحل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("admin.packages.creationSteps")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("admin.packages.step1Title")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.packages.step1Description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("admin.packages.step2Title")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.packages.step2Description")}
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
                      {t("admin.packages.step3Title")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.packages.step3Description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("admin.packages.step4Title")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.packages.step4Description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* اطلاعات پلتفرم‌ها */}
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.packages.platformsInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("admin.packages.platformsInfoDescription")}
              </p>

              <div className="space-y-2">
                {platformConfigs.map((platform) => (
                  <div key={platform.value} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`gap-1 ${platform.color}`}
                    >
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

          {/* نکات مهم */}
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.packages.importantNotes")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("admin.packages.note1")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("admin.packages.note2")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{t("admin.packages.note3")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-orange-700 dark:text-orange-300">
                    {t("admin.packages.warningNote")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* آمار سریع */}
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.packages.quickStats")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {platformConfigs.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.packages.availablePlatforms")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
