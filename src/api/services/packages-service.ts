// src/api/services/packages-service.ts
import axios from "@/lib/axios";
import {
  Package,
  PackageFilters,
  CreatePackageRequest,
  UpdateSdkFeaturesRequest,
  ExtendPackageRequest,
  PaginatedPackages,
} from "@/api/types/packages.types";

export const packagesService = {
  /**
   * دریافت بسته‌های کاربر جاری
   * @param status فیلتر وضعیت (اختیاری)
   */
  getCurrentUserPackages: async (status?: string): Promise<Package[]> => {
    const response = await axios.get("/packages/me", { params: { status } });
    return response.data;
  },

  /**
   * دریافت بسته با شناسه
   * @param packageId شناسه بسته
   */
  getPackageById: async (packageId: string): Promise<Package> => {
    const response = await axios.get(`/packages/${packageId}`);
    return response.data;
  },

  /**
   * دریافت همه بسته‌ها (ادمین)
   * @param filters فیلترهای جستجو
   */
  getAllPackages: async (
    filters?: PackageFilters
  ): Promise<PaginatedPackages> => {
    const response = await axios.get("/packages", { params: filters });
    return response.data;
  },

  /**
   * ایجاد بسته بدون پرداخت (ادمین)
   * @param data اطلاعات بسته جدید
   */
  createPackage: async (
    data: CreatePackageRequest
  ): Promise<{ message: string; package: Package }> => {
    const response = await axios.post("/packages", data);
    return response.data;
  },

  /**
   * به‌روزرسانی ویژگی‌های SDK بسته (ادمین)
   * @param packageId شناسه بسته
   * @param data ویژگی‌های جدید SDK
   */
  updateSdkFeatures: async (
    packageId: string,
    data: UpdateSdkFeaturesRequest
  ): Promise<Package> => {
    const response = await axios.put(
      `/packages/${packageId}/sdk-features`,
      data
    );
    return response.data;
  },

  /**
   * تمدید بسته (ادمین)
   * @param packageId شناسه بسته
   * @param data مدت زمان تمدید (روز)
   */
  extendPackage: async (
    packageId: string,
    data: ExtendPackageRequest
  ): Promise<{ message: string; package: Package }> => {
    const response = await axios.post(`/packages/${packageId}/extend`, data);
    return response.data;
  },

  /**
   * تعلیق بسته (ادمین)
   * @param packageId شناسه بسته
   */
  suspendPackage: async (
    packageId: string
  ): Promise<{ message: string; package: Package }> => {
    const response = await axios.post(`/packages/${packageId}/suspend`);
    return response.data;
  },

  /**
   * فعال‌سازی مجدد بسته (ادمین)
   * @param packageId شناسه بسته
   */
  reactivatePackage: async (
    packageId: string
  ): Promise<{ message: string; package: Package }> => {
    const response = await axios.post(`/packages/${packageId}/reactivate`);
    return response.data;
  },
};
