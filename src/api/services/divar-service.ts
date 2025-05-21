// src/api/services/divar-service.ts
import axios from "@/lib/axios";
import {
  DivarPost,
  DivarPostFilters,
  AddDivarAddonRequest,
  AddDivarAddonResponse,
  PaginatedDivarPosts,
} from "@/api/types/divar.types";

export const divarService = {
  /**
   * دریافت آگهی‌های دیوار کاربر جاری
   * @param filters فیلترهای جستجو
   */
  getDivarPosts: async (
    filters?: DivarPostFilters
  ): Promise<PaginatedDivarPosts> => {
    const response = await axios.get("/divar/posts", { params: filters });
    console.log(response.data.posts, "OOOO");

    // تبدیل ساختار پاسخ به PaginatedDivarPosts
    // اگر API مستقیماً PaginatedDivarPosts برنمی‌گرداند، این تبدیل را انجام می‌دهیم
    return {
      results: response.data.posts || [],
      page: response.data.page || 1,
      limit: response.data.limit || response.data.posts?.length || 10,
      totalPages: response.data.totalPages || 1,
      totalResults:
        response.data.totalResults || response.data.posts?.length || 0,
    };
  },

  /**
   * دریافت اطلاعات یک آگهی دیوار با توکن
   * @param postToken توکن آگهی دیوار
   */
  getDivarPostByToken: async (postToken: string): Promise<DivarPost> => {
    const response = await axios.get(`/divar/posts/${postToken}`);
    return response.data;
  },

  /**
   * افزودن ویجت تست مجازی آرایش به آگهی دیوار
   * @param postToken توکن آگهی دیوار
   * @param data اطلاعات ویجت (شناسه محصول)
   */
  addAddonToPost: async (
    postToken: string,
    data: AddDivarAddonRequest
  ): Promise<AddDivarAddonResponse> => {
    const response = await axios.post(`/divar/add-addon/${postToken}`, data);
    return response.data;
  },

  /**
   * حذف ویجت تست مجازی آرایش از آگهی دیوار
   * @param postToken توکن آگهی دیوار
   */
  removeAddonFromPost: async (
    postToken: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/divar/remove-addon/${postToken}`);
    return response.data;
  },
};
