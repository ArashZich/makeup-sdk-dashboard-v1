// src/api/hooks/usePackages.ts - آپدیت شده
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { packagesService } from "@/api/services/packages-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  PackageFilters,
  CreatePackageRequest,
  UpdateSdkFeaturesRequest,
  ExtendPackageRequest,
  UpdatePackageLimitsRequest,
  PackageStatus,
  PurchasePlatform,
  Package,
} from "@/api/types/packages.types";

/**
 * هوک برای استفاده از API بسته‌ها برای کاربر عادی
 */
export const useUserPackages = () => {
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

  // Helper functions جدید برای کار با purchasePlatform

  /**
   * فیلتر کردن بسته‌ها بر اساس پلتفرم خرید
   * @param packages لیست بسته‌ها
   * @param platform پلتفرم مورد نظر
   */
  const filterPackagesByPlatform = (
    packages: Package[],
    platform: PurchasePlatform
  ): Package[] => {
    return packages.filter((pkg) => pkg.purchasePlatform === platform);
  };

  /**
   * گروه‌بندی بسته‌ها بر اساس پلتفرم خرید
   * @param packages لیست بسته‌ها
   */
  const groupPackagesByPlatform = (packages: Package[]) => {
    const grouped: Record<PurchasePlatform, Package[]> = {
      normal: [],
      divar: [],
      torob: [],
      basalam: [],
    };

    packages.forEach((pkg) => {
      if (grouped[pkg.purchasePlatform]) {
        grouped[pkg.purchasePlatform].push(pkg);
      }
    });

    return grouped;
  };

  /**
   * آمار بسته‌ها بر اساس پلتفرم
   * @param packages لیست بسته‌ها
   */
  const getPackageStatsByPlatform = (packages: Package[]) => {
    const stats: Record<
      PurchasePlatform,
      { count: number; active: number; expired: number }
    > = {
      normal: { count: 0, active: 0, expired: 0 },
      divar: { count: 0, active: 0, expired: 0 },
      torob: { count: 0, active: 0, expired: 0 },
      basalam: { count: 0, active: 0, expired: 0 },
    };

    packages.forEach((pkg) => {
      const platform = pkg.purchasePlatform;
      if (stats[platform]) {
        stats[platform].count++;
        if (pkg.status === "active") {
          stats[platform].active++;
        } else if (pkg.status === "expired") {
          stats[platform].expired++;
        }
      }
    });

    return stats;
  };

  return {
    getUserPackages,
    getPackage,

    // Helper functions جدید
    filterPackagesByPlatform,
    groupPackagesByPlatform,
    getPackageStatsByPlatform,
  };
};

/**
 * هوک برای استفاده از API بسته‌ها برای ادمین - آپدیت شده
 */
export const useAdminPackages = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // دریافت همه بسته‌ها با فیلتر - آپدیت شده با purchasePlatform
  const getAllPackages = (filters?: PackageFilters) => {
    return useQuery({
      queryKey: ["packages", filters],
      queryFn: () => packagesService.getAllPackages(filters),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ایجاد بسته جدید - آپدیت شده با purchasePlatform
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
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
      showToast.success(t("common.success.update"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // به‌روزرسانی محدودیت‌های بسته - جدید
  const updatePackageLimitsMutation = useMutation({
    mutationFn: ({
      packageId,
      data,
    }: {
      packageId: string;
      data: UpdatePackageLimitsRequest;
    }) => packagesService.updatePackageLimits(packageId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["package", data.package._id], data.package);
      // باطل کردن کش بسته‌ها
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({
        queryKey: ["userPackages", data.package.userId],
      });
      showToast.success(t("common.success.update"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
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
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // Helper functions جدید برای ادمین

  /**
   * ایجاد بسته با پلتفرم خاص
   * @param basePackage اطلاعات پایه بسته
   * @param platform پلتفرم خرید
   */
  const createPackageForPlatform = async (
    basePackage: Omit<CreatePackageRequest, "purchasePlatform">,
    platform: PurchasePlatform
  ) => {
    const packageData: CreatePackageRequest = {
      ...basePackage,
      purchasePlatform: platform,
    };

    return createPackageMutation.mutateAsync(packageData);
  };

  /**
   * فیلتر بسته‌ها بر اساس پلتفرم و وضعیت
   * @param platform پلتفرم مورد نظر
   * @param status وضعیت مورد نظر
   */
  const getPackagesByPlatformAndStatus = (
    platform?: PurchasePlatform,
    status?: PackageStatus
  ) => {
    const filters: PackageFilters = {};
    if (platform) filters.purchasePlatform = platform;
    if (status) filters.status = status;

    return getAllPackages(filters);
  };

  /**
   * آمار کلی بسته‌ها بر اساس پلتفرم
   * @param packages لیست بسته‌ها
   */
  const getPlatformAnalytics = (packages: Package[]) => {
    const analytics: Record<
      PurchasePlatform,
      {
        total: number;
        active: number;
        expired: number;
        suspended: number;
        revenue: number; // اگر اطلاعات قیمت در دسترس باشد
      }
    > = {
      normal: { total: 0, active: 0, expired: 0, suspended: 0, revenue: 0 },
      divar: { total: 0, active: 0, expired: 0, suspended: 0, revenue: 0 },
      torob: { total: 0, active: 0, expired: 0, suspended: 0, revenue: 0 },
      basalam: { total: 0, active: 0, expired: 0, suspended: 0, revenue: 0 },
    };

    packages.forEach((pkg) => {
      const platform = pkg.purchasePlatform;
      if (analytics[platform]) {
        analytics[platform].total++;
        analytics[platform][pkg.status]++;

        // اگر اطلاعات قیمت در دسترس باشد
        if (typeof pkg.planId === "object" && "price" in pkg.planId) {
          analytics[platform].revenue += pkg.planId.price;
        }
      }
    });

    return analytics;
  };

  return {
    getAllPackages,
    createPackage: createPackageMutation.mutateAsync,
    updateSdkFeatures: updateSdkFeaturesMutation.mutateAsync,
    extendPackage: extendPackageMutation.mutateAsync,
    updatePackageLimits: updatePackageLimitsMutation.mutateAsync, // جدید
    suspendPackage: suspendPackageMutation.mutateAsync,
    reactivatePackage: reactivatePackageMutation.mutateAsync,
    isCreatingPackage: createPackageMutation.isPending,
    isUpdatingSdkFeatures: updateSdkFeaturesMutation.isPending,
    isExtendingPackage: extendPackageMutation.isPending,
    isUpdatingPackageLimits: updatePackageLimitsMutation.isPending, // جدید
    isSuspendingPackage: suspendPackageMutation.isPending,
    isReactivatingPackage: reactivatePackageMutation.isPending,

    // Helper functions جدید
    createPackageForPlatform,
    getPackagesByPlatformAndStatus,
    getPlatformAnalytics,
  };
};
