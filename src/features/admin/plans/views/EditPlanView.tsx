// src/features/admin/plans/views/EditPlanView.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans, useAdminPlans } from "@/api/hooks/usePlans"; // از هر دو هوک استفاده می‌کنیم
import { PlanForm } from "../components/PlanForm";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { showToast } from "@/lib/toast";

export function EditPlanView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const planId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  // اگر planId خالی باشد، به صفحه لیست پلن‌ها برگردیم
  if (!planId) {
    router.push("/dashboard/admin/plans");
    return null;
  }

  const { getAllPlans } = usePlans(); // برای دریافت پلن‌ها
  const { updatePlan, isUpdatingPlan } = useAdminPlans(); // برای به‌روزرسانی پلن

  const { data: plans, isLoading, error } = getAllPlans();

  // پیدا کردن پلن فعلی از لیست پلن‌ها
  const plan = plans?.find((p) => p._id === planId);

  const handleSubmit = async (data: any) => {
    try {
      await updatePlan({ planId, data });
      showToast.success(t("plans.updateSuccess"));
      router.push(`/dashboard/admin/plans`);
    } catch (error) {
      console.error("Error updating plan:", error);
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
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/admin/plans")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/admin/plans`)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("plans.editPlan")}
          </h1>
          <p className="text-muted-foreground">
            {t("plans.editPlanDescription")}
          </p>
        </div>
      </div>

      <PlanForm
        plan={plan}
        isSubmitting={isUpdatingPlan}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
