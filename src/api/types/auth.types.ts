// src/api/types/auth.types.ts

// انواع پلتفرم‌ها
export type PlatformType = "divar" | "salam" | "otp" | "web" | "api" | "admin";

// مدل توکن‌های دیوار
export interface DivarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // به صورت ISO string
}

// مدل کاربر - Updated
export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  role: "user" | "admin";
  verified: boolean;
  userType?: "real" | "legal";
  nationalId?: string;
  platform: PlatformType; // ✅ تایپ شده
  oauthProvider?: string; // ✅ اضافه شده
  oauthId?: string; // ✅ اضافه شده
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
  divarTokens?: DivarTokens;
}

// مدل توکن
export interface Token {
  token: string;
  expires: string;
}

// مدل توکن‌های دسترسی
export interface Tokens {
  access: Token;
  refresh: Token;
}

// مدل پاسخ ورود
export interface LoginResponse {
  user: User;
  tokens: Tokens;
}

// مدل درخواست ارسال OTP
export interface SendOtpRequest {
  phone: string;
}

// مدل پاسخ ارسال OTP - Updated
export interface SendOtpResponse {
  message: string;
  userId: string;
  requireOtp: boolean;
  platform: string; // ✅ اضافه شده
  otpCode?: string; // فقط در محیط development
}

// مدل درخواست تایید OTP
export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

// مدل درخواست بازیابی توکن
export interface RefreshTokenRequest {
  refreshToken: string;
}

// مدل پاسخ بازیابی توکن
export interface RefreshTokenResponse {
  tokens: Tokens;
}

// مدل درخواست ورود با OAuth
export interface OAuthLoginRequest {
  oauthProvider: string;
  oauthId: string;
  token: string;
  name?: string;
  email?: string;
  phone?: string;
}
