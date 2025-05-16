// src/api/services/plans-service.ts
import axios from "@/lib/axios";
import {
  Plan,
  PlanFilters,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/api/types/plans.types";

export const plansService = {
  /**
   * دریافت پلن‌های عمومی (فعال)
   */
  getPublicPlans: async (): Promise<Plan[]> => {
    const response = await axios.get("/plans/public");
    return response.data;
  },

  /**
   * دریافت همه پلن‌ها
   * @param filters فیلترهای جستجو
   */
  getAllPlans: async (filters?: PlanFilters): Promise<Plan[]> => {
    const response = await axios.get("/plans", { params: filters });
    return response.data;
  },

  /**
   * دریافت پلن با شناسه
   * @param planId شناسه پلن
   */
  getPlanById: async (planId: string): Promise<Plan> => {
    const response = await axios.get(`/plans/${planId}`);
    return response.data;
  },

  /**
   * ایجاد پلن جدید (ادمین)
   * @param data اطلاعات پلن جدید
   */
  createPlan: async (data: CreatePlanRequest): Promise<Plan> => {
    const response = await axios.post("/plans", data);
    return response.data;
  },

  /**
   * به‌روزرسانی پلن (ادمین)
   * @param planId شناسه پلن
   * @param data اطلاعات جدید پلن
   */
  updatePlan: async (
    planId: string,
    data: UpdatePlanRequest
  ): Promise<Plan> => {
    const response = await axios.put(`/plans/${planId}`, data);
    return response.data;
  },

  /**
   * حذف پلن (ادمین)
   * @param planId شناسه پلن
   */
  deletePlan: async (planId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/plans/${planId}`);
    return response.data;
  },
};
