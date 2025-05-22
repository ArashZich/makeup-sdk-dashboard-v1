// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "@/lib/cookies";
import { User } from "@/api/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import axios from "@/lib/axios";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { getCookie, setCookie, removeCookie } = useCookies();
  const authCheckRef = useRef(false);

  // همگام‌سازی با Zustand store
  const {
    setAuth: setAuthStore,
    clearAuth: clearAuthStore,
    updateUser: updateUserStore,
  } = useAuthStore();

  useEffect(() => {
    // بررسی وضعیت احراز هویت هنگام بارگذاری اولیه
    const checkAuth = async () => {
      // اگر قبلاً بررسی شده، اجرا نکن
      if (authCheckRef.current) return;

      const token = getCookie("access_token");

      if (token) {
        try {
          // درخواست برای دریافت اطلاعات کاربر جاری
          const response = await axios.get("/users/me");
          setUser(response.data);
          // همگام‌سازی با store
          setAuthStore(response.data, token, getCookie("refresh_token") || "");
        } catch (error) {
          // در صورت خطا، کوکی‌ها را پاک کرده و کاربر را به صفحه ورود هدایت می‌کنیم
          removeCookie("access_token");
          removeCookie("refresh_token");
          removeCookie("user_role");
          setUser(null);
          clearAuthStore();
        }
      }

      setIsLoading(false);
      authCheckRef.current = true;
    };

    checkAuth();
  }, [getCookie, removeCookie, setAuthStore, clearAuthStore]);

  const login = (token: string, refreshToken: string, userData: User) => {
    // ذخیره توکن‌ها در کوکی
    setCookie("access_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 روز
    });

    setCookie("refresh_token", refreshToken, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز
    });

    setCookie("user_role", userData.role, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز
    });

    // تنظیم اطلاعات کاربر
    setUser(userData);
    // همگام‌سازی با store
    setAuthStore(userData, token, refreshToken);

    // هدایت به داشبورد
    router.push("/dashboard");
  };

  const logout = () => {
    // حذف توکن‌ها از کوکی
    removeCookie("access_token");
    removeCookie("refresh_token");
    removeCookie("user_role");

    // پاک کردن اطلاعات کاربر
    setUser(null);
    // همگام‌سازی با store
    clearAuthStore();

    // هدایت به صفحه ورود
    router.push("/auth/login");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...userData };
      // همگام‌سازی با store
      updateUserStore(userData);
      return newUser;
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
