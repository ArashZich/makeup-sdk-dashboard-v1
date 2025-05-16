// src/api/hooks/usePackages.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { packagesService } from "@/api/services/packages-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PackageFilters,
  CreatePackageRequest,
  UpdateSdkFeaturesRequest,
  ExtendPackageRequest,
  PackageStatus,
} from "@/api/types/packages.types";

/**
 * هوک برای استفاده از API بسته‌ها برای کاربر عادی
 */
export const useUserPackages = () => {
  const { t } = useLanguage();

  // دریافت بسته‌های کاربر جاری با فیلتر وضعیت (اختیاری)
  const getUserPackages = (status?: PackageStatus) => {
    return useQuery({
      queryKey: ["userPackages", status],
      queryFn: () => packagesService.getCurrentUserPackages(status),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت بسته با شناسه
  const getPackage = (packageId: string) => {
    return useQuery({
      queryKey: ["package", packageId],
      queryFn: () => packagesService.getPackageById(packageId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  return {
    getUserPackages,
    getPackage,
  };
};

/**
 * هوک برای استفاده از API بسته‌ها برای ادمین
 */
export const useAdminPackages = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت همه بسته‌ها با فیلتر
  const getAllPackages = (filters?: PackageFilters) => {
    return useQuery({
      queryKey: ["packages", filters],
      queryFn: () => packagesService.getAllPackages(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ایجاد بسته جدید
  const createPackageMutation = useMutation({
    mutationFn: (data: CreatePackageRequest) =>
      packagesService.createPackage(data),
    onSuccess: (data) => {
      // باطل کردن کش بسته‌ها
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({
        queryKey: ["userPackages", data.package.userId],
      });
      showToast.success(t("common.success.create"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // به‌روزرسانی ویژگی‌های SDK بسته
  const updateSdkFeaturesMutation = useMutation({
    mutationFn: ({
      packageId,
      data,
    }: {
      packageId: string;
      data: UpdateSdkFeaturesRequest;
    }) => packagesService.updateSdkFeatures(packageId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["package", data._id], data);
      showToast.success(t("common.success.update"));
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // تمدید بسته
  const extendPackageMutation = useMutation({
    mutationFn: ({
      packageId,
      data,
    }: {
      packageId: string;
      data: ExtendPackageRequest;
    }) => packagesService.extendPackage(packageId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["package", data.package._id], data.package);
      // باطل کردن کش بسته‌ها
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({
        queryKey: ["userPackages", data.package.userId],
      });
      showToast.success(
        t("packages.admin.extendPackage") + ": " + t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // تعلیق بسته
  const suspendPackageMutation = useMutation({
    mutationFn: (packageId: string) =>
      packagesService.suspendPackage(packageId),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["package", data.package._id], data.package);
      // باطل کردن کش بسته‌ها
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({
        queryKey: ["userPackages", data.package.userId],
      });
      showToast.success(
        t("packages.admin.suspendPackage") + ": " + t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  // فعال‌سازی مجدد بسته
  const reactivatePackageMutation = useMutation({
    mutationFn: (packageId: string) =>
      packagesService.reactivatePackage(packageId),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["package", data.package._id], data.package);
      // باطل کردن کش بسته‌ها
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({
        queryKey: ["userPackages", data.package.userId],
      });
      showToast.success(
        t("packages.admin.reactivatePackage") +
          ": " +
          t("common.success.update")
      );
    },
    onError: (error: any) => {
      showToast.error(
        error.response?.data?.message || t("common.error.general")
      );
    },
  });

  return {
    getAllPackages,
    createPackage: createPackageMutation.mutateAsync,
    updateSdkFeatures: updateSdkFeaturesMutation.mutateAsync,
    extendPackage: extendPackageMutation.mutateAsync,
    suspendPackage: suspendPackageMutation.mutateAsync,
    reactivatePackage: reactivatePackageMutation.mutateAsync,
    isCreatingPackage: createPackageMutation.isPending,
    isUpdatingSdkFeatures: updateSdkFeaturesMutation.isPending,
    isExtendingPackage: extendPackageMutation.isPending,
    isSuspendingPackage: suspendPackageMutation.isPending,
    isReactivatingPackage: reactivatePackageMutation.isPending,
  };
};
