// src/features/admin/plans/views/PlansView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans, useAdminPlans } from "@/api/hooks/usePlans"; // از هر دو هوک استفاده می‌کنیم
import { Plan, PlanFilters } from "@/api/types/plans.types";
import { DeletePlanDialog } from "../components/DeletePlanDialog";
import { PlanTable } from "../components/PlanTable";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Package, AlertCircle } from "lucide-react";

export function PlansView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [filters, setFilters] = useState<PlanFilters>({});
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const { getAllPlans } = usePlans(); // برای دریافت لیست پلن‌ها
  const { deletePlan, isDeletingPlan } = useAdminPlans(); // برای حذف پلن

  const { data: plans, isLoading, error, refetch } = getAllPlans(filters);

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
      console.error("Error deleting plan:", error);
    }
  };

  const handleFilterChange = (newFilters: PlanFilters) => {
    setFilters(newFilters);
  };

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

      {/* لیست پلن‌ها */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader size="lg" text="common.loading" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error.title")}</AlertTitle>
          <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>
        </Alert>
      ) : plans && plans.length > 0 ? (
        <PlanTable plans={plans} onDeletePlan={handleDeleteClick} />
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t("plans.noPlans")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("plans.noPlansDescription")}
          </p>
          <Button
            onClick={() => router.push("/dashboard/admin/plans/create")}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("plans.addPlan")}
          </Button>
        </div>
      )}

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
