// src/api/hooks/useSdk.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { sdkService } from "@/api/services/sdk-service";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getErrorMessage, type ApiError } from "@/api/types/error.types";
import {
  ValidateTokenRequest,
  ApplyMakeupRequest,
} from "@/api/types/sdk.types";

/**
 * هوک برای استفاده از API SDK
 */
export const useSdk = (token?: string) => {
  const { t } = useLanguage();
  const hasToken = Boolean(token);

  // اعتبارسنجی توکن SDK
  const validateTokenMutation = useMutation({
    mutationFn: (data: ValidateTokenRequest) => sdkService.validateToken(data),
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // دریافت محصولات برای SDK
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["sdkProducts", token],
    queryFn: () => sdkService.getProducts(token!),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

  // دریافت محصول با UID برای SDK
  const getProductByUid = (productUid: string) => {
    return useQuery({
      queryKey: ["sdkProduct", token, productUid],
      queryFn: () => sdkService.getProductByUid(token!, productUid),
      enabled: hasToken && Boolean(productUid),
      staleTime: 5 * 60 * 1000, // 5 دقیقه
    });
  };

  // درخواست اعمال آرایش
  const applyMakeupMutation = useMutation({
    mutationFn: (data: ApplyMakeupRequest) =>
      sdkService.applyMakeup(token!, data),
    onError: (error: ApiError) => {
      showToast.error(getErrorMessage(error, t("common.error.general")));
    },
  });

  // دریافت وضعیت SDK
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["sdkStatus", token],
    queryFn: () => sdkService.getStatus(token!),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000, // 5 دقیقه
  });

  return {
    validateToken: validateTokenMutation.mutateAsync,
    isValidatingToken: validateTokenMutation.isPending,
    validationResult: validateTokenMutation.data,

    products,
    isLoadingProducts,
    productsError,
    refetchProducts,

    getProductByUid,

    applyMakeup: applyMakeupMutation.mutateAsync,
    isApplyingMakeup: applyMakeupMutation.isPending,

    status,
    isLoadingStatus,
    statusError,
    refetchStatus,
  };
};
