// src/api/hooks/usePlans.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansService } from "@/api/services/plans-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PlanFilters,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/api/types/plans.types";

/**
 * هوک برای استفاده از API پلن‌ها برای کاربر عادی
 */
export const usePlans = () => {
  const { t } = useLanguage();

  // دریافت پلن‌های عمومی (فعال)
  const {
    data: publicPlans,
    isLoading: isLoadingPublicPlans,
    error: publicPlansError,
    refetch: refetchPublicPlans,
  } = useQuery({
    queryKey: ["publicPlans"],
    queryFn: plansService.getPublicPlans,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

  // دریافت همه پلن‌ها
  const getAllPlans = (filters?: PlanFilters) => {
    return useQuery({
      queryKey: ["plans", filters],
      queryFn: () => plansService.getAllPlans(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت پلن با شناسه
  const getPlan = (planId: string) => {
    return useQuery({
      queryKey: ["plan", planId],
      queryFn: () => plansService.getPlanById(planId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  return {
    publicPlans,
    isLoadingPublicPlans,
    publicPlansError,
    refetchPublicPlans,
    getAllPlans,
    getPlan,
  };
};

/**
 * هوک برای استفاده از API پلن‌ها برای ادمین
 */
export const useAdminPlans = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ایجاد پلن جدید
  const createPlanMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => plansService.createPlan(data),
    onSuccess: () => {
      // باطل کردن کش پلن‌ها
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlans"] });
      showToast.success(t("common.success.create"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی پلن
  const updatePlanMutation = useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string;
      data: UpdatePlanRequest;
    }) => plansService.updatePlan(planId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["plan", data._id], data);
      // باطل کردن کش پلن‌ها
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlans"] });
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // حذف پلن
  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => plansService.deletePlan(planId),
    onSuccess: (_, planId) => {
      // حذف از کش
      queryClient.removeQueries({ queryKey: ["plan", planId] });
      // باطل کردن کش پلن‌ها
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlans"] });
      showToast.success(t("common.success.delete"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreatingPlan: createPlanMutation.isPending,
    isUpdatingPlan: updatePlanMutation.isPending,
    isDeletingPlan: deletePlanMutation.isPending,
  };
};
