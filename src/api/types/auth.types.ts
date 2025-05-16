// src/api/types/auth.types.ts

// مدل کاربر
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
  allowedDomains?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
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

// مدل پاسخ ارسال OTP
export interface SendOtpResponse {
  message: string;
  userId: string;
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
