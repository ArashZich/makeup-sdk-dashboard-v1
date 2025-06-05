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
   * ✅ دریافت محصولات کاربر جاری با pagination
   * @param filters فیلترهای جستجو
   * @param page شماره صفحه (پیش‌فرض: 1)
   * @param limit تعداد آیتم در هر صفحه (پیش‌فرض: 4)
   */
  getCurrentUserProducts: async (
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 4
  ): Promise<PaginatedProducts> => {
    const params = {
      ...filters,
      page,
      limit,
      sortBy: "createdAt:desc", // جدیدترین محصولات اول
    };

    const response = await axios.get("/products/me", { params });
    return response.data;
  },

  /**
   * ✅ دریافت همه محصولات (ادمین) با pagination
   * @param filters فیلترهای جستجو
   * @param page شماره صفحه
   * @param limit تعداد آیتم در هر صفحه
   */
  getAllProducts: async (
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedProducts> => {
    const params = {
      ...filters,
      page,
      limit,
      sortBy: "createdAt:desc",
    };

    const response = await axios.get("/products", { params });
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
   * ✅ به‌روزرسانی محصول - فیکس شده برای حذف فیلدهای غیرمجاز
   * @param productId شناسه محصول
   * @param data اطلاعات جدید محصول
   */
  updateProduct: async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    // ✅ حذف فیلدهای غیرمجاز قبل از ارسال
    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      userId,
      uid,
      type, // ✅ type هم نباید در update باشه
      code, // ✅ code هم نباید در update باشه
      ...cleanData
    } = data as any;

    const response = await axios.put(`/products/${productId}`, cleanData);
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
   * ✅ دریافت محصولات کاربر (ادمین) با pagination
   * @param userId شناسه کاربر
   * @param filters فیلترهای جستجو
   * @param page شماره صفحه
   * @param limit تعداد آیتم در هر صفحه
   */
  getUserProducts: async (
    userId: string,
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedProducts> => {
    const params = {
      ...filters,
      page,
      limit,
      sortBy: "createdAt:desc",
    };

    const response = await axios.get(`/products/user/${userId}`, { params });
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
   * ✅ به‌روزرسانی محصول کاربر (ادمین) - فیکس کامل شده
   * @param userId شناسه کاربر
   * @param productId شناسه محصول
   * @param data اطلاعات جدید محصول
   */
  updateUserProduct: async (
    userId: string,
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    // ✅ فیلتر کامل فیلدهای غیرمجاز
    const allowedFields = [
      "name",
      "description",
      "thumbnail",
      "patterns",
      "colors",
      "active",
    ];

    const cleanData: any = {};

    // ✅ فقط فیلدهای مجاز کپی کن
    for (const key of allowedFields) {
      if (key in data && (data as any)[key] !== undefined) {
        cleanData[key] = (data as any)[key];
      }
    }

    const response = await axios.put(
      `/products/user/${userId}/${productId}`,
      cleanData
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
