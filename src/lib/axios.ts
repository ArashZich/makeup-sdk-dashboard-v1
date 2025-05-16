// src/lib/axios.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useCookies } from "./cookies";

// آدرس پایه API
const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// ایجاد نمونه axios
const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// افزودن interceptor برای اضافه کردن توکن به هدرها
axiosInstance.interceptors.request.use(
  (config) => {
    const { getCookie } = useCookies();
    const token = getCookie("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// افزودن interceptor برای مدیریت پاسخ‌ها و خطاها
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const { getCookie, setCookie, removeCookie } = useCookies();

    // اگر خطای 401 (Unauthorized) دریافت شد و قبلاً تلاش برای بازیابی توکن نکرده‌ایم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // تلاش برای نوسازی توکن با استفاده از refresh token
        const refreshToken = getCookie("refresh_token");

        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            refreshToken,
          });

          const { tokens } = response.data;

          // ذخیره توکن‌های جدید
          setCookie("access_token", tokens.access.token, {
            expires: new Date(tokens.access.expires),
          });

          setCookie("refresh_token", tokens.refresh.token, {
            expires: new Date(tokens.refresh.expires),
          });

          // تنظیم هدر Authorization برای درخواست اصلی و ارسال مجدد
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.access.token}`;
          } else {
            originalRequest.headers = {
              Authorization: `Bearer ${tokens.access.token}`,
            };
          }

          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // در صورت خطا در نوسازی توکن، کاربر را خارج می‌کنیم
        removeCookie("access_token");
        removeCookie("refresh_token");
        removeCookie("user_role");

        // در صورتی که در مرورگر هستیم، به صفحه لاگین هدایت می‌کنیم
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
