// src/api/hooks/useProducts.ts
import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { productsService } from "@/api/services/products-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/api/types/products.types";
import { logger } from "@/lib/logger";

/**
 * هوک برای استفاده از API محصولات برای کاربر عادی
 */
export const useProducts = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ✅ دریافت محصولات کاربر جاری با Infinite Query
  const getUserProducts = (filters?: ProductFilters) => {
    return useInfiniteQuery({
      queryKey: ["userProducts", filters],
      queryFn: ({ pageParam = 1 }) =>
        productsService.getCurrentUserProducts(filters, pageParam, 4), // 4 محصول در هر صفحه
      getNextPageParam: (lastPage) => {
        // اگر صفحه بعدی وجود داشته باشه، شماره اون رو برگردون
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined; // دیگه صفحه‌ای نیست
      },
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      initialPageParam: 1,
    });
  };

  // دریافت محصول با شناسه
  const getProduct = (productId: string) => {
    return useQuery({
      queryKey: ["product", productId],
      queryFn: () => productsService.getProductById(productId),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // دریافت محصول با UID
  const getProductByUid = (productUid: string) => {
    return useQuery({
      queryKey: ["product", "uid", productUid],
      queryFn: () => productsService.getProductByUid(productUid),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // ایجاد محصول جدید
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productsService.createProduct(data),
    onSuccess: () => {
      // باطل کردن کش محصولات
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });
      showToast.success(t("common.success.create"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // به‌روزرسانی محصول
  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductRequest;
    }) => productsService.updateProduct(productId, data),
    onSuccess: (data) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["product", data._id], data);
      queryClient.setQueryData(["product", "uid", data.uid], data);
      // باطل کردن کش محصولات
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });
      showToast.success(t("common.success.update"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // حذف محصول
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productsService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      // حذف از کش
      queryClient.removeQueries({ queryKey: ["product", productId] });
      // باطل کردن کش محصولات
      queryClient.invalidateQueries({ queryKey: ["userProducts"] });
      showToast.success(t("common.success.delete"));
    },
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  return {
    getUserProducts,
    getProduct,
    getProductByUid,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
  };
};

/**
 * هوک برای استفاده از API محصولات برای ادمین
 */
export const useAdminProducts = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // ✅ دریافت محصولات یک کاربر خاص (با userId برای ادمین) - معمولی
  const getUserProducts = (
    userId: string,
    filters?: ProductFilters,
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: ["adminUserProducts", userId, filters],
      queryFn: () => productsService.getUserProducts(userId, filters, 1, 10), // ادمین با pagination عادی
      staleTime: 5 * 60 * 1000, // 5 دقیقه
      enabled: options?.enabled ?? Boolean(userId), // ✅ فقط اگر userId موجود باشه
    });
  };

  // ✅ دریافت تمام محصولات (برای ادمین) - معمولی
  const getAllProducts = (filters?: ProductFilters) => {
    return useQuery({
      queryKey: ["adminAllProducts", filters],
      queryFn: () => productsService.getAllProducts(filters, 1, 50), // ادمین با pagination عادی
      staleTime: 5 * 60 * 1000,
    });
  };

  // ایجاد محصول برای کاربر
  const createProductForUserMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateProductRequest;
    }) => {
      logger.api("🎯 Hook - createProductForUser called with:", {
        userId,
        data,
      });
      return productsService.createProductForUser(userId, data);
    },
    onSuccess: (data, { userId }) => {
      // باطل کردن کش محصولات کاربر
      queryClient.invalidateQueries({
        queryKey: ["adminUserProducts", userId],
      });
      showToast.success(t("common.success.create"));
    },
    onError: (error: ApiError) => {
      logger.fail("🔴 Hook - createProductForUser error:", error);
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // ✅ به‌روزرسانی محصول کاربر - اصلاح شده
  const updateUserProductMutation = useMutation({
    mutationFn: ({
      userId,
      productId,
      data,
    }: {
      userId: string;
      productId: string;
      data: UpdateProductRequest;
    }) => {
      logger.api("🎯 Hook - updateUserProduct called with:", {
        userId,
        productId,
        data,
      });

      // ✅ اطمینان از اینکه فقط فیلدهای مجاز ارسال شن
      const cleanData = {
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        patterns: data.patterns,
        colors: data.colors,
        active: data.active,
      };

      logger.api("🟢 Hook - Clean data being sent:", cleanData);

      return productsService.updateUserProduct(userId, productId, cleanData);
    },
    onSuccess: (data, { userId }) => {
      // به‌روزرسانی کش
      queryClient.setQueryData(["product", data._id], data);
      queryClient.setQueryData(["product", "uid", data.uid], data);
      // باطل کردن کش محصولات کاربر
      queryClient.invalidateQueries({
        queryKey: ["adminUserProducts", userId],
      });
      showToast.success(t("common.success.update"));
    },
    onError: (error: ApiError) => {
      logger.fail("🔴 Hook - updateUserProduct error:", error);
      logger.fail(
        "🔴 Hook - Error response:",
        (error as { response?: { data?: unknown } }).response?.data
      );
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // حذف محصول کاربر
  const deleteUserProductMutation = useMutation({
    mutationFn: ({
      userId,
      productId,
    }: {
      userId: string;
      productId: string;
    }) => {
      logger.api("🎯 Hook - deleteUserProduct called with:", {
        userId,
        productId,
      });
      return productsService.deleteUserProduct(userId, productId);
    },
    onSuccess: (_, { userId, productId }) => {
      // حذف از کش
      queryClient.removeQueries({ queryKey: ["product", productId] });
      // باطل کردن کش محصولات کاربر
      queryClient.invalidateQueries({
        queryKey: ["adminUserProducts", userId],
      });
      showToast.success(t("common.success.delete"));
    },
    onError: (error: ApiError) => {
      logger.fail("🔴 Hook - deleteUserProduct error:", error);
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  return {
    getUserProducts, // برای یک کاربر خاص
    getAllProducts, // برای تمام محصولات
    createProductForUser: createProductForUserMutation.mutateAsync,
    updateUserProduct: updateUserProductMutation.mutateAsync,
    deleteUserProduct: deleteUserProductMutation.mutateAsync,
    isCreatingProductForUser: createProductForUserMutation.isPending,
    isUpdatingUserProduct: updateUserProductMutation.isPending,
    isDeletingUserProduct: deleteUserProductMutation.isPending,
  };
};
