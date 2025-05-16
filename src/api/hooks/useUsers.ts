// src/api/hooks/useUsers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/api/services/users-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  UserFilters,
  UpdateProfileRequest,
  UpdateDomainsRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/api/types/users.types";

/**
 * هوک برای استفاده از API کاربران برای کاربر عادی
 */
export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت پروفایل کاربر جاری
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: usersService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

  // به‌روزرسانی پروفایل کاربر جاری
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      usersService.updateProfile(data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["userProfile"], data);
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی دامنه‌های مجاز کاربر جاری
  const updateDomainsMutation = useMutation({
    mutationFn: (data: UpdateDomainsRequest) =>
      usersService.updateDomains(data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["userProfile"], data);
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetchProfile: refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    updateDomains: updateDomainsMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingDomains: updateDomainsMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API کاربران برای ادمین
 */
export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت لیست کاربران با فیلتر
  const getUsers = (filters?: UserFilters) => {
    return useQuery({
      queryKey: ["users", filters],
      queryFn: () => usersService.getAllUsers(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت یک کاربر خاص با شناسه
  const getUser = (userId: string) => {
    return useQuery({
      queryKey: ["user", userId],
      queryFn: () => usersService.getUserById(userId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ایجاد کاربر جدید
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersService.createUser(data),
    onSuccess: () => {
      // باطل کردن کش کاربران
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(t("common.success.create"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی کاربر
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => usersService.updateUser(userId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["user", data._id], data);
      // باطل کردن کش کاربران
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی دامنه‌های کاربر
  const updateUserDomainsMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateDomainsRequest;
    }) => usersService.updateUserDomains(userId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["user", data._id], data);
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // حذف کاربر
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // حذف از کش
      queryClient.removeQueries({ queryKey: ["user", userId] });
      // باطل کردن کش کاربران
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast.success(t("common.success.delete"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getUsers,
    getUser,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    updateUserDomains: updateUserDomainsMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isUpdatingUserDomains: updateUserDomainsMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
  };
};
