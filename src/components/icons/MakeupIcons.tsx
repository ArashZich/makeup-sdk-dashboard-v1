// src/components/icons/MakeupIcons.tsx
"use client";

import { LucideProps } from "lucide-react";

// آیکون لب
export function LipsIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2c-4 0-8 2-8 6 0 2 1 3 2 4 1 1 2 1 3 1h6c1 0 2 0 3-1 1-1 2-2 2-4 0-4-4-6-8-6z" />
      <path d="M12 8c-2 0-4 1-4 3s2 3 4 3 4-1 4-3-2-3-4-3z" />
    </svg>
  );
}

// آیکون سایه چشم
export function EyeshadowIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="12" rx="10" ry="6" />
      <ellipse cx="12" cy="10" rx="6" ry="3" />
      <ellipse cx="12" cy="8" rx="3" ry="1.5" />
    </svg>
  );
}

// آیکون مداد چشم
export function EyepencilIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 3L18 6L6 18L3 21L6 18Z" />
      <circle cx="12" cy="12" r="2" />
      <path d="M8 16L16 8" />
    </svg>
  );
}

// آیکون خط چشم
export function EyelinerIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18" />
      <path d="M21 12c0-1-1-2-2-2H5c-1 0-2 1-2 2s1 2 2 2h14c1 0 2-1 2-2z" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

// آیکون مژه
export function EyelashesIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="12" rx="10" ry="3" />
      <path d="M8 9v-2" />
      <path d="M10 8v-3" />
      <path d="M12 7v-4" />
      <path d="M14 8v-3" />
      <path d="M16 9v-2" />
    </svg>
  );
}

// آیکون رژگونه
export function BlushIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="12" r="4" />
      <circle cx="16" cy="12" r="4" />
      <path d="M8 16c2-1 4-1 6 0" />
    </svg>
  );
}

// آیکون کانسیلر
export function ConcealerIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M10 10l4 4" />
      <path d="M14 10l-4 4" />
    </svg>
  );
}

// آیکون فاندیشن
export function FoundationIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M9 9h6" />
      <path d="M9 15h6" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  );
}

// آیکون ابرو
export function BrowsIcon(props: LucideProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8c2-2 6-2 8 0s6 2 8 0" />
      <path d="M4 16c2-2 6-2 8 0s6 2 8 0" />
    </svg>
  );
}

// تایپ برای نوع محصولات
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

// نقشه آیکون‌ها
export const PRODUCT_TYPE_ICONS: Record<
  ProductType,
  React.ComponentType<LucideProps>
> = {
  lips: LipsIcon,
  eyeshadow: EyeshadowIcon,
  eyepencil: EyepencilIcon,
  eyeliner: EyelinerIcon,
  eyelashes: EyelashesIcon,
  blush: BlushIcon,
  concealer: ConcealerIcon,
  foundation: FoundationIcon,
  brows: BrowsIcon,
};

// هوک برای دریافت آیکون محصول
export function useProductIcon(type: ProductType) {
  return PRODUCT_TYPE_ICONS[type];
}
