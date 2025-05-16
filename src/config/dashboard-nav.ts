// src/config/dashboard-nav.ts
import {
  BarChart4,
  Bell,
  BoxIcon,
  CreditCard,
  Home,
  Package,
  PanelRight,
  Settings,
  ShoppingBag,
  TagIcon,
  Users,
  User,
} from "lucide-react";
import { SidebarGroup } from "@/types/layout/dashboard";

// تعریف منوهای سایدبار داشبورد
export const dashboardNavItems: SidebarGroup[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "dashboard.title",
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
        badge: {
          text: "9+",
          variant: "danger",
        },
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
        id: "admin",
        label: "admin.title",
        path: "/dashboard/admin",
        icon: PanelRight,
        permission: "admin",
        children: [
          {
            id: "admin-analytics",
            label: "analytics.title",
            path: "/dashboard/admin/analytics",
            permission: "admin",
          },
          {
            id: "admin-users",
            label: "admin.users.title",
            path: "/dashboard/admin/users",
            permission: "admin",
          },
          {
            id: "admin-plans",
            label: "plans.title",
            path: "/dashboard/admin/plans",
            permission: "admin",
          },
          {
            id: "admin-products",
            label: "products.title",
            path: "/dashboard/admin/products",
            permission: "admin",
          },
          {
            id: "admin-coupons",
            label: "admin.coupons.title",
            path: "/dashboard/admin/coupons",
            permission: "admin",
          },
        ],
      },
    ],
  },
];
