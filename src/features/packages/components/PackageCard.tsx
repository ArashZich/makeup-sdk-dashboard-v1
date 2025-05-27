// src/features/packages/components/PackageCard.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, PackageStatus } from "@/api/types/packages.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, getDaysRemaining } from "@/lib";
import {
  Calendar,
  Clock,
  Package as PackageIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { getPlatformDetails } from "@/constants/platform-configs";
import { RenewPackageDialog } from "./RenewPackageDialog";

interface PackageCardProps {
  package: Package;
  onView: (packageId: string) => void;
}

export function PackageCard({ package: pkg, onView }: PackageCardProps) {
  const { t, isRtl } = useLanguage();
  const [showRenewDialog, setShowRenewDialog] = useState(false);

  // Status icon based on package status
  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "suspended":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Status color and text based on package status
  const getStatusDetails = (status: PackageStatus) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-500/10 text-green-500",
          text: t("packages.status.active"),
        };
      case "expired":
        return {
          color: "bg-red-500/10 text-red-500",
          text: t("packages.status.expired"),
        };
      case "suspended":
        return {
          color: "bg-yellow-500/10 text-yellow-500",
          text: t("packages.status.suspended"),
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-500",
          text: t("packages.status.unknown"),
        };
    }
  };

  // Helper function برای نمایش مقادیر نامحدود
  const formatLimitValue = (value: number) => {
    if (value === -1) return t("common.unlimited");
    return value.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  // محاسبه درصد استفاده
  const getUsagePercentage = () => {
    if (pkg.requestLimit.total === -1) return 0; // unlimited
    if (pkg.requestLimit.total === 0) return 100;

    const used = pkg.requestLimit.total - pkg.requestLimit.remaining;
    return Math.round((used / pkg.requestLimit.total) * 100);
  };

  const statusDetails = getStatusDetails(pkg.status);
  const platformDetails = getPlatformDetails(pkg.purchasePlatform, t);

  const planName =
    pkg.planId && typeof pkg.planId !== "string"
      ? pkg.planId.name
      : t("packages.unknownPlan");

  const remainingDays = getDaysRemaining(pkg.endDate);
  const isActive = pkg.status === "active";
  const needsRenewal = isActive && remainingDays <= 7; // پیشنهاد تمدید برای کمتر از 7 روز مانده به انقضا
  const isExpired = pkg.status === "expired"; // بسته منقضی شده
  const usagePercent = getUsagePercentage();

  // وقتی بسته منقضی شده یا نزدیک به انقضاست، امکان تمدید نمایش داده می‌شود
  const showRenewOption = isExpired || needsRenewal;

  return (
    <Card
      className={`overflow-hidden ${needsRenewal ? "border-amber-400" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{planName}</CardTitle>
          <div className="flex flex-col gap-1">
            <Badge className={statusDetails.color + " border-none"}>
              <span className="flex items-center gap-1">
                {getStatusIcon(pkg.status)}
                {statusDetails.text}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-0 space-y-4">
        {/* اطلاعات پایه */}
        <div className="flex justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {t("packages.packageId")}: {pkg._id.substring(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDate(pkg.endDate, isRtl ? "fa-IR" : "en-US")}
            </span>
          </div>
        </div>

        {/* پلتفرم خرید */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("packages.purchasePlatform")}:
          </span>
          <Badge variant="outline" className={`gap-1 ${platformDetails.color}`}>
            {platformDetails.icon}
            {platformDetails.text}
          </Badge>
        </div>

        {/* زمان باقی‌مانده */}
        {isActive && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span
              className={`text-sm ${
                needsRenewal ? "text-amber-500 font-medium" : ""
              }`}
            >
              {t("packages.remainingDays", { count: remainingDays })}
            </span>
          </div>
        )}

        {/* نمایش هشدار برای بسته‌های نزدیک به انقضا */}
        {needsRenewal && (
          <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 p-2 rounded-md text-sm">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            {t("packages.expirationWarning")}
          </div>
        )}

        {/* Request limits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t("packages.requestLimits")}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("packages.requestLimit.total")}
              </span>
              <span className="font-medium">
                {formatLimitValue(pkg.requestLimit.total)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("packages.requestLimit.remaining")}
              </span>
              <span className="font-medium">
                {formatLimitValue(pkg.requestLimit.remaining)}
              </span>
            </div>

            {/* Progress bar فقط برای محدود نمایش داده می‌شود */}
            {pkg.requestLimit.total !== -1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("packages.usageProgress")}
                  </span>
                  <span>{usagePercent}%</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
            )}

            {/* نمایش وضعیت unlimited */}
            {pkg.requestLimit.total === -1 && (
              <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-2 rounded-md text-sm text-center">
                {t("packages.unlimitedRequests")}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex gap-2 flex-wrap">
        <Button
          className={showRenewOption ? "flex-1" : "w-full"}
          variant={isActive ? "default" : "outline"}
          onClick={() => onView(pkg._id)}
        >
          {t("packages.viewDetails")}
        </Button>

        {showRenewOption && (
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => setShowRenewDialog(true)}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {t("packages.renewPackage")}
          </Button>
        )}
      </CardFooter>

      {/* دیالوگ تمدید بسته */}
      <RenewPackageDialog
        isOpen={showRenewDialog}
        onClose={() => setShowRenewDialog(false)}
        packageData={pkg}
      />
    </Card>
  );
}
