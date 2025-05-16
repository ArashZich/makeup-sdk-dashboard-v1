// src/api/types/sdk.types.ts

// مدل اعتبارسنجی توکن SDK
export interface ValidateTokenRequest {
  token: string;
}

// مدل پاسخ اعتبارسنجی توکن SDK
export interface ValidateTokenResponse {
  isValid: boolean;
  message?: string;
  isPremium?: boolean;
  projectType?: string;
  features?: string[];
  patterns?: Record<string, string[]>;
  mediaFeatures?: {
    allowedSources: string[];
    allowedViews: string[];
    comparisonModes: string[];
  };
}

// مدل درخواست اعمال آرایش
export interface ApplyMakeupRequest {
  productUid?: string;
  makeupData: {
    type: string;
    pattern?: string;
    color?: string;
    intensity?: number;
    position?: {
      x: number;
      y: number;
    };
    customData?: Record<string, any>;
  };
}

// مدل پاسخ اعمال آرایش
export interface ApplyMakeupResponse {
  success: boolean;
  message: string;
}

// مدل وضعیت SDK
export interface SdkStatus {
  packageId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: string;
  features: string[];
  isPremium: boolean;
  projectType: string;
  requestLimit: {
    monthly: number;
    remaining: number;
  };
  usageStats: {
    total: number;
    validate: number;
    apply: number;
    check: number;
    other: number;
  };
}
