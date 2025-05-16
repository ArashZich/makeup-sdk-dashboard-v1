// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// صفحات مستثنی از redirect
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/verify-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// بررسی اینکه آیا مسیر عمومی است
const isPublicPath = (path: string) => {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
};

// بررسی اینکه آیا مسیر داشبورد است
const isDashboardPath = (path: string) => {
  return path.startsWith("/dashboard");
};

// بررسی اینکه آیا مسیر ادمین است
const isAdminPath = (path: string) => {
  return path.startsWith("/dashboard/admin");
};

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const { pathname } = nextUrl;

  // کوکی‌های احراز هویت
  const accessToken = cookies.get("access_token")?.value;
  const refreshToken = cookies.get("refresh_token")?.value;
  const userRoleCookie = cookies.get("user_role")?.value;

  // تنظیم زبان
  const locale = cookies.get("NEXT_LOCALE")?.value || "fa";

  // اگر کاربر لاگین نشده و به صفحه داشبورد می‌رود، به صفحه لاگین هدایت می‌شود
  if (isDashboardPath(pathname) && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // اگر کاربر لاگین شده و به صفحه لاگین می‌رود، به صفحه داشبورد هدایت می‌شود
  if (isPublicPath(pathname) && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // اگر کاربر ادمین نیست و به صفحات ادمین می‌رود، به صفحه داشبورد هدایت می‌شود
  if (isAdminPath(pathname) && userRoleCookie !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // تنظیم هدرهای زبان و جهت
  const response = NextResponse.next();
  response.headers.set("x-language", locale);
  response.headers.set("x-direction", locale === "fa" ? "rtl" : "ltr");

  return response;
}

// تنظیم مسیرهایی که باید middleware روی آنها اجرا شود
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
