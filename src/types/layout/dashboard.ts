// src/types/layout/dashboard.ts
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

// تایپ برای آیتم منوی سایدبار
export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  children?: Omit<SidebarItem, "icon" | "children">[];
  permission?: "user" | "admin" | "all";
  badge?: {
    text: string;
    variant:
      | "default"
      | "primary"
      | "secondary"
      | "danger"
      | "success"
      | "warning";
  };
  // اضافه کردن فیلد جدید که مشخص می‌کنه آیا این آیتم نیاز به اتصال دیوار داره
  requiresDivarAuth?: boolean;
}

// تایپ برای گروه منوی سایدبار
export interface SidebarGroup {
  id: string;
  title?: string;
  items: SidebarItem[];
}

// تایپ برای پراپس لایوت داشبورد
export interface DashboardLayoutProps {
  children: ReactNode;
}

// تایپ برای پراپس هدر داشبورد
export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: {
    label: string;
    path: string;
  }[];
}

// تایپ برای پراپس صفحه داشبورد
export interface DashboardPageProps {
  title: string;
  description?: string;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
}
