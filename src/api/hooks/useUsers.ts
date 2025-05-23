// src/api/hooks/useUsers.ts - اضافه کردن hook جدید

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/api/services/users-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/auth.store";
import {
  UserFilters,
  UpdateProfileRequest,
  UpdateDomainsRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserSdkFeaturesResponse, // تایپ جدید
} from "@/api/types/users.types";

/**
 * هوک برای استفاده از API کاربران برای کاربر عادی
 */
export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { updateUser: updateUserStore } = useAuthStore();

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
      queryClient.setQueryData(["userProfile"], data);
      updateUserStore(data);
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
      queryClient.setQueryData(["userProfile"], data);
      updateUserStore(data);
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
 * هوک جدید برای دریافت ویژگی‌های SDK کاربر جاری
 * این هوک بر اساس بسته فعال کاربر، ویژگی‌های مجاز SDK را برمی‌گرداند
 */
export const useUserSdkFeatures = () => {
  const {
    data: sdkFeatures,
    isLoading,
    error,
    refetch,
  } = useQuery<UserSdkFeaturesResponse>({
    queryKey: ["userSdkFeatures"],
    queryFn: usersService.getUserSdkFeatures,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
    refetchOnWindowFocus: false,
  });

  // Helper functions برای تسهیل کار با داده‌ها
  const hasActivePackage = sdkFeatures?.hasActivePackage ?? false;
  const isPremium = sdkFeatures?.isPremium ?? false;
  const features = (
    sdkFeatures?.hasActivePackage === true ? sdkFeatures.features : []
  ) as any[];

  // دریافت الگوهای مجاز برای یک نوع آرایش خاص
  const getPatternsForType = (type: string): string[] => {
    if (!sdkFeatures || !sdkFeatures.hasActivePackage) return [];

    const feature = sdkFeatures.features.find((f) => f.type === type);
    return feature?.patterns ?? [];
  };

  // بررسی دسترسی به یک نوع آرایش خاص
  const hasAccessToType = (type: string): boolean => {
    if (!sdkFeatures || !sdkFeatures.hasActivePackage) return false;

    return sdkFeatures.features.some((f) => f.type === type);
  };

  // بررسی دسترسی به یک منبع رسانه‌ای
  const hasMediaAccess = (source: string): boolean => {
    if (!sdkFeatures || !sdkFeatures.hasActivePackage) return false;

    return sdkFeatures.mediaFeatures.allowedSources.includes(source);
  };

  // دریافت اطلاعات بسته (اگر موجود باشد)
  const packageInfo =
    sdkFeatures?.hasActivePackage === true && "packageInfo" in sdkFeatures
      ? sdkFeatures.packageInfo
      : null;

  // دریافت ویژگی‌های رسانه‌ای
  const mediaFeatures =
    sdkFeatures?.hasActivePackage === true && "mediaFeatures" in sdkFeatures
      ? sdkFeatures.mediaFeatures
      : { allowedSources: [], allowedViews: [], comparisonModes: [] };

  return {
    // داده‌های اصلی
    sdkFeatures,
    isLoading,
    error,
    refetch,

    // Helper properties
    hasActivePackage,
    isPremium,
    features,
    packageInfo,
    mediaFeatures,

    // Helper functions
    getPatternsForType,
    hasAccessToType,
    hasMediaAccess,
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
      queryClient.setQueryData(["user", data._id], data);
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
      queryClient.removeQueries({ queryKey: ["user", userId] });
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
