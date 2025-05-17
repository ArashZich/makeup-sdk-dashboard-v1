// src/features/packages/components/PackageCard.tsx
"use client";

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
import { formatDate, getDaysRemaining } from "@/lib";
import {
  Calendar,
  Clock,
  Package as PackageIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface PackageCardProps {
  package: Package;
  onView: (packageId: string) => void;
}

export function PackageCard({ package: pkg, onView }: PackageCardProps) {
  const { t, isRtl } = useLanguage();

  // status icon base on package status
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

  // status color and text based on package status
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

  const statusDetails = getStatusDetails(pkg.status);
  const planName =
    pkg.planId && typeof pkg.planId !== "string"
      ? pkg.planId.name
      : t("packages.unknownPlan");

  const remainingDays = getDaysRemaining(pkg.endDate);
  const isActive = pkg.status === "active";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{planName}</CardTitle>
          <Badge className={statusDetails.color + " border-none"}>
            <span className="flex items-center gap-1">
              {getStatusIcon(pkg.status)}
              {statusDetails.text}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-0 space-y-4">
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

        {isActive && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {t("packages.remainingDays", { count: remainingDays })}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {/* Request limit display */}
          <div className="flex justify-between">
            <span className="text-sm">
              {t("packages.requestLimit.monthly")}
            </span>
            <span className="text-sm font-medium">
              {pkg.requestLimit.monthly}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">
              {t("packages.requestLimit.remaining")}
            </span>
            <span className="text-sm font-medium">
              {pkg.requestLimit.remaining}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={isActive ? "default" : "outline"}
          onClick={() => onView(pkg._id)}
        >
          {t("packages.viewDetails")}
        </Button>
      </CardFooter>
    </Card>
  );
}
