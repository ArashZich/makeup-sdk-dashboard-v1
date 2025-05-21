// src/api/hooks/useDivar.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { divarService } from "@/api/services/divar-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DivarPostFilters,
  AddDivarAddonRequest,
} from "@/api/types/divar.types";

/**
 * هوک برای استفاده از API های دیوار
 */
export const useDivar = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت آگهی‌های دیوار کاربر
  const getDivarPosts = (filters?: DivarPostFilters) => {
    return useQuery({
      queryKey: ["divarPosts", filters],
      queryFn: () => divarService.getDivarPosts(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت اطلاعات یک آگهی با توکن
  const getDivarPost = (postToken: string) => {
    return useQuery({
      queryKey: ["divarPost", postToken],
      queryFn: () => divarService.getDivarPostByToken(postToken),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: Boolean(postToken), // فقط زمانی اجرا شود که توکن وجود داشته باشد
    });
  };

  // افزودن ویجت تست مجازی به آگهی
  const addAddonMutation = useMutation({
    mutationFn: ({
      postToken,
      data,
    }: {
      postToken: string;
      data: AddDivarAddonRequest;
    }) => divarService.addAddonToPost(postToken, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش آگهی
      if (data.post) {
        queryClient.setQueryData(["divarPost", data.post.token], data.post);
      }

      // باطل کردن کش آگهی‌ها برای به‌روزرسانی لیست
      queryClient.invalidateQueries({ queryKey: ["divarPosts"] });

      showToast.success(t("divar.addonAdded"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("divar.error.addAddonFailed")
      );
    },
  });

  // حذف ویجت تست مجازی از آگهی
  const removeAddonMutation = useMutation({
    mutationFn: (postToken: string) =>
      divarService.removeAddonFromPost(postToken),
    onSuccess: (_, postToken) => {
      // باطل کردن کش آگهی‌ها برای به‌روزرسانی لیست
      queryClient.invalidateQueries({ queryKey: ["divarPosts"] });
      queryClient.invalidateQueries({ queryKey: ["divarPost", postToken] });

      showToast.success(t("divar.addonRemoved"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("divar.error.removeAddonFailed")
      );
    },
  });

  return {
    getDivarPosts,
    getDivarPost,
    addAddonToPost: addAddonMutation.mutateAsync,
    removeAddonFromPost: removeAddonMutation.mutateAsync,
    isAddingAddon: addAddonMutation.isPending,
    isRemovingAddon: removeAddonMutation.isPending,
  };
};
