// src/features/packages/views/PackageDetailsView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useUserPackages } from "@/api/hooks/usePackages";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  InfoIcon,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart,
  Cpu,
} from "lucide-react";
import { formatDate, getDaysRemaining } from "@/lib";
import { SdkFeaturesCard } from "@/features/sdk/components/SdkFeaturesCard";
import { SdkTokenCard } from "@/features/sdk/components/SdkTokenCard";

interface PackageDetailsViewProps {
  packageId: string;
}

export function PackageDetailsView({ packageId }: PackageDetailsViewProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { getPackage } = useUserPackages();

  const { data: packageData, isLoading, error } = getPackage(packageId);

  const handleBack = () => {
    router.back();
  };

  const handleBuyNewPlan = () => {
    router.push("/dashboard/plans");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("packages.error.title")}</AlertTitle>
        <AlertDescription>
          {t("packages.error.packageNotFound")}
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" onClick={handleBack}>
            {t("common.back")}
          </Button>
        </div>
      </Alert>
    );
  }

  const isActive = packageData.status === "active";
  const isExpired = packageData.status === "expired";
  const isSuspended = packageData.status === "suspended";

  const remainingDays = getDaysRemaining(packageData.endDate);

  const usagePercent =
    packageData.requestLimit.monthly > 0
      ? Math.round(
          ((packageData.requestLimit.monthly -
            packageData.requestLimit.remaining) /
            packageData.requestLimit.monthly) *
            100
        )
      : 0;

  const planName =
    packageData.planId && typeof packageData.planId !== "string"
      ? packageData.planId.name
      : t("packages.unknownPlan");

  // Status icon based on package status
  const getStatusIcon = () => {
    if (isActive) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isExpired) return <XCircle className="h-5 w-5 text-red-500" />;
    if (isSuspended)
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          {isRtl ? (
            <ArrowRight className="h-4 w-4 mr-2" />
          ) : (
            <ArrowLeft className="h-4 w-4 mr-2" />
          )}
          {t("common.back")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main info card */}
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{planName}</CardTitle>
                  <CardDescription>
                    {t("packages.packageDetails")}
                  </CardDescription>
                </div>
                <Badge
                  className={`
                    ${isActive ? "bg-green-500/10 text-green-500" : ""}
                    ${isExpired ? "bg-red-500/10 text-red-500" : ""}
                    ${isSuspended ? "bg-yellow-500/10 text-yellow-500" : ""}
                    border-none
                  `}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon()}
                    {t(`packages.status.${packageData.status}`)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dates and Time Info */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t("packages.startDate")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(
                        packageData.startDate,
                        isRtl ? "fa-IR" : "en-US"
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t("packages.endDate")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(
                        packageData.endDate,
                        isRtl ? "fa-IR" : "en-US"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {isActive && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t("packages.timeRemaining")}
                    </span>
                    <span className="text-sm">
                      {t("packages.remainingDays", { count: remainingDays })}
                    </span>
                  </div>
                  <Progress
                    value={(remainingDays / 30) * 100}
                    className="h-2"
                  />
                </div>
              )}

              <Separator />

              {/* Request Limits */}
              <div>
                <h3 className="text-sm font-medium mb-4">
                  {t("packages.requestLimits")}
                </h3>
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {t("packages.requestLimit.monthly")}
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {packageData.requestLimit.monthly}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {t("packages.requestLimit.remaining")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {packageData.requestLimit.remaining}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {t("packages.usageProgress")}
                      </span>
                      <span className="text-sm">{usagePercent}%</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!isActive && (
                <Button className="w-full" onClick={handleBuyNewPlan}>
                  {t("plans.buyPlan")}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* SDK Features Card */}
          <SdkFeaturesCard sdkFeatures={packageData.sdkFeatures} />
        </div>

        {/* Token card for active packages */}
        <div className="w-full md:w-1/3">
          {isActive && (
            <SdkTokenCard
              token={packageData.token}
              packageId={packageData._id}
            />
          )}

          {!isActive && (
            <Card>
              <CardHeader>
                <CardTitle>{t("packages.packageExpired")}</CardTitle>
                <CardDescription>
                  {t("packages.packageExpiredDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>{t("packages.renewPackage")}</AlertTitle>
                  <AlertDescription>
                    {t("packages.renewPackageDescription")}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleBuyNewPlan}>
                  {t("plans.buyPlan")}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
