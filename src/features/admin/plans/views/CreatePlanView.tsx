// src/features/admin/plans/views/CreatePlanView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminPlans } from "@/api/hooks/usePlans";
import { PlanForm } from "../components/PlanForm";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { BackButtonIcon } from "@/components/common/BackButton";

export function CreatePlanView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createPlan, isCreatingPlan } = useAdminPlans();

  const handleSubmit = async (data: any) => {
    try {
      await createPlan(data);
      showToast.success(t("plans.createSuccess"));
      router.push("/dashboard/admin/plans");
    } catch (error) {
      logger.error("Error creating plan:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BackButtonIcon href="/dashboard/admin/plans" />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("plans.addPlan")}
          </h1>
          <p className="text-muted-foreground">
            {t("plans.addPlanDescription")}
          </p>
        </div>
      </div>

      <PlanForm isSubmitting={isCreatingPlan} onSubmit={handleSubmit} />
    </div>
  );
}
