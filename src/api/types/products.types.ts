// src/api/types/products.types.ts
import { PaginatedResponse } from "@/types/common.types";

// مدل الگو
export interface Pattern {
  name: string;
  code: string;
  imageUrl: string;
}

// مدل رنگ
export interface Color {
  name: string;
  hexCode: string;
  imageUrl: string;
}

// مدل محصول
export interface Product {
  _id: string;
  userId: string;
  name: string;
  description: string;
  type: "lips" | "eyeshadow" | "eyepencil" | "eyelashes" | "blush" | "eyeliner";
  code: string;
  uid: string;
  thumbnail: string;
  patterns: Pattern[];
  colors: Color[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// فیلترهای جستجوی محصولات
export interface ProductFilters {
  active?: boolean;
  page?: number;
  limit?: number;
}

// مدل درخواست ایجاد محصول
export interface CreateProductRequest {
  name: string;
  description: string;
  type: "lips" | "eyeshadow" | "eyepencil" | "eyelashes" | "blush" | "eyeliner";
  code: string;
  thumbnail: string;
  patterns: Pattern[];
  colors: Color[];
  active: boolean;
}

// مدل درخواست به‌روزرسانی محصول
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
  patterns?: Pattern[];
  colors?: Color[];
  active?: boolean;
}

// تایپ پاسخ صفحه‌بندی شده محصولات
export type PaginatedProducts = PaginatedResponse<Product>;
