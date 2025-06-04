// src/config/dashboard-nav.ts - آپدیت شده
import {
  BarChart4,
  Bell,
  BoxIcon,
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingBag,
  TagIcon,
  Users,
  User,
  // اضافه کردن آیکون برای دیوار
  ExternalLink,
} from "lucide-react";
import { SidebarGroup } from "@/types/layout/dashboard";

// تعریف منوهای سایدبار داشبورد
export const dashboardNavItems: SidebarGroup[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "dashboard.overview",
        path: "/dashboard",
        icon: Home,
        permission: "all",
      },
      {
        id: "analytics",
        label: "analytics.title",
        path: "/dashboard/analytics",
        icon: BarChart4,
        permission: "all",
      },
    ],
  },
  {
    id: "product",
    title: "products.title",
    items: [
      {
        id: "products",
        label: "products.title",
        path: "/dashboard/products",
        icon: ShoppingBag,
        permission: "all",
      },
      {
        id: "packages",
        label: "packages.title",
        path: "/dashboard/packages",
        icon: Package,
        permission: "all",
      },
      {
        id: "plans",
        label: "plans.title",
        path: "/dashboard/plans",
        icon: BoxIcon,
        permission: "all",
      },
      // اضافه کردن آیتم دیوار به منو
      {
        id: "divar",
        label: "divar.title",
        path: "/dashboard/divar",
        icon: ExternalLink,
        permission: "all",
        // نیاز به دیوار توکن
        requiresDivarAuth: true,
      },
    ],
  },
  {
    id: "billing",
    title: "payments.title",
    items: [
      {
        id: "payments",
        label: "payments.title",
        path: "/dashboard/payments",
        icon: CreditCard,
        permission: "all",
      },
    ],
  },
  {
    id: "user",
    title: "profile.title",
    items: [
      {
        id: "notifications",
        label: "notifications.title",
        path: "/dashboard/notifications",
        icon: Bell,
        permission: "all",
        // حذف badge ثابت - حالا از API می‌خونیم
      },
      {
        id: "profile",
        label: "profile.title",
        path: "/dashboard/profile",
        icon: User,
        permission: "all",
      },
      {
        id: "settings",
        label: "settings.title",
        path: "/dashboard/settings",
        icon: Settings,
        permission: "all",
      },
    ],
  },
  {
    id: "admin",
    title: "admin.title",
    items: [
      {
        id: "admin-users",
        label: "admin.users.title",
        path: "/dashboard/admin/users",
        icon: Users,
        permission: "admin",
      },
      {
        id: "admin-plans",
        label: "plans.title",
        path: "/dashboard/admin/plans",
        icon: Package,
        permission: "admin",
      },
      {
        id: "admin-packages",
        label: "admin.packages.title",
        path: "/dashboard/admin/packages",
        icon: Package,
        permission: "admin",
      },
      {
        id: "admin-notifications",
        label: "admin.notifications.title",
        path: "/dashboard/admin/notifications",
        icon: Bell,
        permission: "admin",
      },
      {
        id: "admin-products",
        label: "products.title",
        path: "/dashboard/admin/products",
        icon: ShoppingBag,
        permission: "admin",
      },
      {
        id: "admin-payments",
        label: "payments.title",
        path: "/dashboard/admin/payments",
        icon: CreditCard,
        permission: "admin",
      },
      {
        id: "admin-coupons",
        label: "admin.coupons.title",
        path: "/dashboard/admin/coupons",
        icon: TagIcon,
        permission: "admin",
      },
      {
        id: "admin-analytics",
        label: "analytics.title",
        path: "/dashboard/admin/analytics",
        icon: BarChart4,
        permission: "admin",
      },
    ],
  },
];
