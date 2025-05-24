// src/constants/product-patterns.ts

export type ProductType =
  | "lips"
  | "eyeshadow"
  | "eyepencil"
  | "eyeliner"
  | "eyelashes"
  | "blush"
  | "concealer"
  | "foundation"
  | "brows";

// ✅ Patterns مجاز برای هر نوع محصول
export const ALLOWED_PATTERNS: Record<ProductType, string[]> = {
  lips: ["normal", "matte", "glossy", "glitter"],
  eyeshadow: ["normal"],
  eyepencil: ["normal"],
  eyeliner: ["normal", "lashed"],
  eyelashes: ["long-lash"],
  blush: ["normal"],
  concealer: ["normal"],
  foundation: ["normal"],
  brows: ["normal"],
};

// ✅ تابع برای دریافت patterns مجاز یک نوع محصول
export function getAllowedPatternsForType(type: ProductType): string[] {
  return ALLOWED_PATTERNS[type] || [];
}

// ✅ تابع برای بررسی معتبر بودن pattern برای یک نوع محصول
export function isPatternValidForType(
  type: ProductType,
  pattern: string
): boolean {
  return ALLOWED_PATTERNS[type]?.includes(pattern) || false;
}

// ✅ تابع برای دریافت همه انواع محصولات
export function getAllProductTypes(): ProductType[] {
  return Object.keys(ALLOWED_PATTERNS) as ProductType[];
}

// ✅ تابع برای دریافت همه patterns (برای validation)
export function getAllAllowedPatterns(): string[] {
  return Object.values(ALLOWED_PATTERNS).flat();
}
