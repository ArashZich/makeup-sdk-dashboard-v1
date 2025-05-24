// src/features/admin/packages/views/CreatePackageView.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPackages } from "@/api/hooks/usePackages";
import { PackageForm } from "../components/PackageForm";
import { ArrowLeft } from "lucide-react";
import { CreatePackageRequest } from "@/api/types/packages.types";

export function CreatePackageView() {
  const { t } = useLanguage();
  const router = useRouter();

  const { createPackage, isCreatingPackage } = useAdminPackages();

  const handleSubmit = async (data: CreatePackageRequest) => {
    try {
      await createPackage(data);
      router.push("/dashboard/admin/packages");
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center space-x-4 space-x-reverse">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
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
