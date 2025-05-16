// src/api/services/sdk-service.ts
import axios from "@/lib/axios";
import {
  ValidateTokenRequest,
  ValidateTokenResponse,
  ApplyMakeupRequest,
  ApplyMakeupResponse,
  SdkStatus,
} from "@/api/types/sdk.types";
import { Product } from "@/api/types/products.types";

export const sdkService = {
  /**
   * اعتبارسنجی توکن SDK
   * @param data درخواست اعتبارسنجی توکن
   */
  validateToken: async (
    data: ValidateTokenRequest
  ): Promise<ValidateTokenResponse> => {
    const response = await axios.post("/sdk/validate", data);
    return response.data;
  },

  /**
   * دریافت محصولات برای SDK
   * @param token توکن SDK
   */
  getProducts: async (token: string): Promise<Product[]> => {
    const response = await axios.get("/sdk/products", {
      headers: {
        "x-sdk-token": token,
      },
    });
    return response.data;
  },

  /**
   * دریافت محصول با UID برای SDK
   * @param token توکن SDK
   * @param productUid شناسه منحصر به فرد کوتاه محصول
   */
  getProductByUid: async (
    token: string,
    productUid: string
  ): Promise<Product> => {
    const response = await axios.get(`/sdk/products/${productUid}`, {
      headers: {
        "x-sdk-token": token,
      },
    });
    return response.data;
  },

  /**
   * درخواست اعمال آرایش
   * @param token توکن SDK
   * @param data اطلاعات اعمال آرایش
   */
  applyMakeup: async (
    token: string,
    data: ApplyMakeupRequest
  ): Promise<ApplyMakeupResponse> => {
    const response = await axios.post("/sdk/apply", data, {
      headers: {
        "x-sdk-token": token,
      },
    });
    return response.data;
  },

  /**
   * دریافت وضعیت SDK
   * @param token توکن SDK
   */
  getStatus: async (token: string): Promise<SdkStatus> => {
    const response = await axios.get("/sdk/status", {
      headers: {
        "x-sdk-token": token,
      },
    });
    return response.data;
  },
};
