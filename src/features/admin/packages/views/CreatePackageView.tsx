// src/features/admin/packages/views/CreatePackageView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { PackageForm } from "../components/PackageForm";
import { CreatePackageRequest } from "@/api/types/packages.types";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";

export function CreatePackageView() {
  const { t } = useLanguage();
  const router = useRouter();

  const { createPackage, isCreatingPackage } = useAdminPackages();

  const handleSubmit = async (data: CreatePackageRequest) => {
    try {
      await createPackage(data);
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
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.packages.createPackage")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.packages.form.title")}
          </p>
        </div>
      </div>

      {/* فرم ایجاد بسته */}
      <div className="max-w-2xl">
        <PackageForm onSubmit={handleSubmit} isLoading={isCreatingPackage} />
      </div>
    </div>
  );
}
