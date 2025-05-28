// src/api/services/users-service.ts - اضافه کردن تابع جدید

import axios from "@/lib/axios";
import {
  User,
  UserFilters,
  UpdateProfileRequest,
  UpdateDomainsRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateRequiredInfoRequest, // 🆕 جدید
  UpdateRequiredInfoResponse, // 🆕 جدید
  PaginatedUsers,
  UserSdkFeaturesResponse, // تایپ جدید اضافه شده
} from "@/api/types/users.types";

export const usersService = {
  /**
   * دریافت پروفایل کاربر جاری
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get("/users/me");
    return response.data;
  },

  /**
   * به‌روزرسانی اطلاعات ضروری کاربر (جدید) 🆕
   * @param data اطلاعات ضروری (نوع کاربر و کد/شناسه ملی)
   */
  updateRequiredInfo: async (
    data: UpdateRequiredInfoRequest
  ): Promise<UpdateRequiredInfoResponse> => {
    const response = await axios.put("/users/me/required-info", data);
    return response.data;
  },

  /**
   * دریافت ویژگی‌های SDK کاربر جاری (تابع جدید)
   * بر اساس بسته فعال کاربر، لیست ویژگی‌های آرایشی و الگوهای مجاز را برمی‌گرداند
   */
  getUserSdkFeatures: async (): Promise<UserSdkFeaturesResponse> => {
    const response = await axios.get("/users/me/sdk-features");
    return response.data;
  },

  /**
   * به‌روزرسانی پروفایل کاربر جاری
   * @param data اطلاعات جدید پروفایل
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await axios.put("/users/me", data);
    return response.data;
  },

  /**
   * به‌روزرسانی دامنه‌های مجاز کاربر جاری
   * @param data دامنه‌های جدید
   */
  updateDomains: async (data: UpdateDomainsRequest): Promise<User> => {
    const response = await axios.put("/users/me/domains", data);
    return response.data;
  },

  /**
   * دریافت همه کاربران (ادمین)
   * @param filters فیلترهای جستجو
   */
  getAllUsers: async (filters?: UserFilters): Promise<PaginatedUsers> => {
    const response = await axios.get("/users", { params: filters });
    return response.data;
  },

  /**
   * دریافت کاربر با شناسه (ادمین)
   * @param userId شناسه کاربر
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * ایجاد کاربر جدید (ادمین)
   * @param data اطلاعات کاربر جدید
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await axios.post("/users", data);
    return response.data;
  },

  /**
   * به‌روزرسانی کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param data اطلاعات جدید کاربر
   */
  updateUser: async (
    userId: string,
    data: UpdateUserRequest
  ): Promise<User> => {
    const response = await axios.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * به‌روزرسانی دامنه‌های مجاز کاربر (ادمین)
   * @param userId شناسه کاربر
   * @param data دامنه‌های جدید
   */
  updateUserDomains: async (
    userId: string,
    data: UpdateDomainsRequest
  ): Promise<User> => {
    const response = await axios.put(`/users/${userId}/domains`, data);
    return response.data;
  },

  /**
   * حذف کاربر (ادمین)
   * @param userId شناسه کاربر
   */
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/users/${userId}`);
    return response.data;
  },
};
