// src/constants/platform-configs.ts

import { JSX } from "react";
import { TargetPlatform } from "@/api/types/plans.types";
import { PurchasePlatform } from "@/api/types/packages.types";
import { Globe, Smartphone, ExternalLink } from "lucide-react";

// تابع برای دریافت تنظیمات پلتفرم‌های Plans
export const getPlanPlatformConfigs = (t: (key: string) => string) => [
  {
    value: "all" as TargetPlatform,
    label: t("plans.platforms.all"),
    icon: <Globe className="h-4 w-4" />,
    description: t("plans.platformDescriptions.all"),
  },
  {
    value: "normal" as TargetPlatform,
    label: t("plans.platforms.normal"),
    icon: <Smartphone className="h-4 w-4" />,
    description: t("plans.platformDescriptions.normal"),
  },
  {
    value: "divar" as TargetPlatform,
    label: t("plans.platforms.divar"),
    icon: <ExternalLink className="h-4 w-4" />,
    description: t("plans.platformDescriptions.divar"),
  },
  {
    value: "torob" as TargetPlatform,
    label: t("plans.platforms.torob"),
    icon: <Smartphone className="h-4 w-4" />,
    description: t("plans.platformDescriptions.torob"),
  },
  {
    value: "basalam" as TargetPlatform,
    label: t("plans.platforms.basalam"),
    icon: <Smartphone className="h-4 w-4" />,
    description: t("plans.platformDescriptions.basalam"),
  },
];

// تابع برای دریافت تنظیمات پلتفرم‌های Packages
export const getPackagePlatformConfigs = (t: (key: string) => string) => [
  {
    value: "normal" as PurchasePlatform,
    label: t("packages.platforms.normal"),
    icon: <Globe className="h-4 w-4" />,
    description: t("packages.platformDescriptions.normal"),
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    value: "divar" as PurchasePlatform,
    label: t("packages.platforms.divar"),
    icon: <ExternalLink className="h-4 w-4" />,
    description: t("packages.platformDescriptions.divar"),
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  {
    value: "torob" as PurchasePlatform,
    label: t("packages.platforms.torob"),
    icon: <Smartphone className="h-4 w-4" />,
    description: t("packages.platformDescriptions.torob"),
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  {
    value: "basalam" as PurchasePlatform,
    label: t("packages.platforms.basalam"),
    icon: <Smartphone className="h-4 w-4" />,
    description: t("packages.platformDescriptions.basalam"),
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
];

// Helper function برای پیدا کردن تنظیمات یک پلتفرم خاص (Plans)
export const getPlanPlatformConfig = (
  platform: TargetPlatform,
  t: (key: string) => string
) => {
  return getPlanPlatformConfigs(t).find((config) => config.value === platform);
};

// Helper function برای پیدا کردن تنظیمات یک پلتفرم خاص (Packages)
export const getPackagePlatformConfig = (
  platform: PurchasePlatform,
  t: (key: string) => string
) => {
  return getPackagePlatformConfigs(t).find(
    (config) => config.value === platform
  );
};

// تابع کامل برای دریافت جزئیات پلتفرم Packages (مشابه switch case قبلی)
export const getPlatformDetails = (
  platform: PurchasePlatform,
  t: (key: string) => string
) => {
  const config = getPackagePlatformConfig(platform, t);

  if (config) {
    return {
      icon: config.icon,
      color: config.color,
      text: config.label,
      description: config.description,
    };
  }

  // Default case
  return {
    icon: <Globe className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-800",
    text: platform,
    description: "",
  };
};

// تابع کامل برای دریافت جزئیات پلتفرم Plans
export const getPlanPlatformDetails = (
  platform: TargetPlatform,
  t: (key: string) => string
) => {
  const config = getPlanPlatformConfig(platform, t);

  if (config) {
    return {
      icon: config.icon,
      text: config.label,
      description: config.description,
    };
  }

  // Default case
  return {
    icon: <Globe className="h-4 w-4" />,
    text: platform,
    description: "",
  };
};

// تایپ‌ها برای TypeScript
export type PlanPlatformConfig = {
  value: TargetPlatform;
  label: string;
  icon: JSX.Element;
  description: string;
};

export type PackagePlatformConfig = {
  value: PurchasePlatform;
  label: string;
  icon: JSX.Element;
  description: string;
  color: string;
};
