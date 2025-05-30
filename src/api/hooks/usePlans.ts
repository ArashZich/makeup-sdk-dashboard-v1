// src/api/hooks/usePlans.ts - آپدیت شده
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansService } from "@/api/services/plans-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  PlanFilters,
  CreatePlanRequest,
  UpdatePlanRequest,
  Plan,
  TargetPlatform,
} from "@/api/types/plans.types";

/**
 * هوک برای استفاده از API پلن‌ها برای کاربر عادی - آپدیت شده
 */
export const usePlans = () => {
  // دریافت پلن‌های عمومی (فعال) - آپدیت شده با فیلتر خودکار پلتفرم
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

  // Helper functions جدید برای کار با targetPlatforms

  /**
   * فیلتر کردن پلن‌ها بر اساس پلتفرم خاص
   * @param plans لیست پلن‌ها
   * @param platform پلتفرم مورد نظر
   */
  const filterPlansByPlatform = (
    plans: Plan[],
    platform: TargetPlatform
  ): Plan[] => {
    return plans.filter(
      (plan) =>
        plan.targetPlatforms.includes("all") ||
        plan.targetPlatforms.includes(platform)
    );
  };

  /**
   * بررسی اینکه آیا پلن برای پلتفرم خاص مناسب است
   * @param plan پلن مورد بررسی
   * @param platform پلتفرم مورد نظر
   */
  const isPlanAvailableForPlatform = (
    plan: Plan,
    platform: TargetPlatform
  ): boolean => {
    return (
      plan.targetPlatforms.includes("all") ||
      plan.targetPlatforms.includes(platform)
    );
  };

  /**
   * دریافت پلن‌های ویژه (specialOffer = true)
   * @param plans لیست پلن‌ها
   */
  const getSpecialOfferPlans = (plans: Plan[]): Plan[] => {
    return plans.filter((plan) => plan.specialOffer && plan.active);
  };

  /**
   * گروه‌بندی پلن‌ها بر اساس پلتفرم
   * @param plans لیست پلن‌ها
   */
  const groupPlansByPlatform = (plans: Plan[]) => {
    const grouped: Record<TargetPlatform, Plan[]> = {
      all: [],
      normal: [],
      divar: [],
      torob: [],
      basalam: [],
    };

    plans.forEach((plan) => {
      plan.targetPlatforms.forEach((platform) => {
        if (grouped[platform]) {
          grouped[platform].push(plan);
        }
      });
    });

    return grouped;
  };

  return {
    // داده‌های اصلی
    publicPlans,
    isLoadingPublicPlans,
    publicPlansError,
    refetchPublicPlans,
    getAllPlans,
    getPlan,

    // Helper functions جدید
    filterPlansByPlatform,
    isPlanAvailableForPlatform,
    getSpecialOfferPlans,
    groupPlansByPlatform,
  };
};

/**
 * هوک برای استفاده از API پلن‌ها برای ادمین - آپدیت شده
 */
export const useAdminPlans = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ایجاد پلن جدید - آپدیت شده با targetPlatforms
  const createPlanMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => plansService.createPlan(data),
    onSuccess: () => {
      // باطل کردن کش پلن‌ها
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlans"] });
      showToast.success(t("common.success.create"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // به‌روزرسانی پلن - آپدیت شده با targetPlatforms
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // Helper function برای ادمین - ایجاد پلن با پلتفرم‌های مختلف
  const createPlanForMultiplePlatforms = async (
    basePlan: Omit<CreatePlanRequest, "targetPlatforms">,
    platforms: TargetPlatform[]
  ) => {
    const planData: CreatePlanRequest = {
      ...basePlan,
      targetPlatforms: platforms,
    };

    return createPlanMutation.mutateAsync(planData);
  };

  return {
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreatingPlan: createPlanMutation.isPending,
    isUpdatingPlan: updatePlanMutation.isPending,
    isDeletingPlan: deletePlanMutation.isPending,

    // Helper function برای ادمین
    createPlanForMultiplePlatforms,
  };
};
