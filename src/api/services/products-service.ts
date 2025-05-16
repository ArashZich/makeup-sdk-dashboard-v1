// src/api/services/products-service.ts
import axios from "@/lib/axios";
import {
  Product,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  PaginatedProducts,
} from "@/api/types/products.types";

export const productsService = {
  /**
   * دریافت محصولات کاربر جاری
   * @param filters فیلترهای جستجو
   */
  getCurrentUserProducts: async (
    filters?: ProductFilters
  ): Promise<Product[]> => {
    const response = await axios.get("/products/me", { params: filters });
    return response.data;
  },

  /**
   * ایجاد محصول جدید
   * @param data اطلاعات محصول جدید
   */
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axios.post("/products", data);
    return response.data;
  },

  /**
   * دریافت محصول با شناسه
   * @param productId شناسه محصول
   */
  getProductById: async (productId: string): Promise<Product> => {
    const response = await axios.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * دریافت محصول با UID
   * @param productUid شناسه منحصر به فرد کوتاه محصول
   */
  getProductByUid: async (productUid: string): Promise<Product> => {
    const response = await axios.get(`/products/uid/${productUid}`);
    return response.data;
  },

  /**
   * به‌روزرسانی محصول
   * @param productId شناسه محصول
   * @param data اطلاعات جدید محصول
   */
  updateProduct: async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    const response = await axios.put(`/products/${productId}`, data);
    return response.data;
  },

  /**
   * حذف محصول
   * @param productId شناسه محصول
   */
  deleteProduct: async (productId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/products/${productId}`);
    return response.data;
  },

  /**
   * دریافت محصولات کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param filters فیلترهای جستجو
   */
  getUserProducts: async (
    userId: string,
    filters?: ProductFilters
  ): Promise<Product[]> => {
    const response = await axios.get(`/products/user/${userId}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * ایجاد محصول برای کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param data اطلاعات محصول جدید
   */
  createProductForUser: async (
    userId: string,
    data: CreateProductRequest
  ): Promise<Product> => {
    const response = await axios.post(`/products/user/${userId}`, data);
    return response.data;
  },

  /**
   * به‌روزرسانی محصول کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param productId شناسه محصول
   * @param data اطلاعات جدید محصول
   */
  updateUserProduct: async (
    userId: string,
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    const response = await axios.put(
      `/products/user/${userId}/${productId}`,
      data
    );
    return response.data;
  },

  /**
   * حذف محصول کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param productId شناسه محصول
   */
  deleteUserProduct: async (
    userId: string,
    productId: string
  ): Promise<{ message: string }> => {
    const response = await axios.delete(
      `/products/user/${userId}/${productId}`
    );
    return response.data;
  },
};
