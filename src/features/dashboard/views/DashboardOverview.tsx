// src/features/dashboard/views/DashboardOverview.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPackages } from "@/api/hooks/usePackages";
import { usePlans } from "@/api/hooks/usePlans";
import { Package } from "@/api/types/packages.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getDaysRemaining, formatDate } from "@/lib";
import {
  PackageIcon,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Info,
} from "lucide-react";

export function DashboardOverview() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { getUserPackages } = useUserPackages();
  const { publicPlans, isLoadingPublicPlans } = usePlans();

  const { data: activePackages, isLoading: isLoadingPackages } =
    getUserPackages("active");
  const [activePackage, setActivePackage] = useState<Package | null>(null);

  useEffect(() => {
    if (activePackages && activePackages.length > 0) {
      // فرض می‌کنیم اولین بسته فعال، بسته فعلی کاربر است
      setActivePackage(activePackages[0]);
    }
  }, [activePackages]);

  if (isLoadingPackages || isLoadingPublicPlans) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  const hasActivePlan = activePackage !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.overview")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcomeMessage")}
          </p>
        </div>

        {!hasActivePlan && (
          <Button
            onClick={() => router.push("/dashboard/plans")}
            className="self-start"
          >
            {t("plans.buyPlan")}
          </Button>
        )}
      </div>

      {!hasActivePlan ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("dashboard.noPlanTitle")}</AlertTitle>
          <AlertDescription>
            {t("dashboard.noPlanDescription")}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* بسته فعال */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("packages.activePackage")}
              </CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activePackage.planId &&
                typeof activePackage.planId !== "string"
                  ? activePackage.planId.name
                  : t("packages.package")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("packages.status")}: {t(`packages.${activePackage.status}`)}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4 pt-0">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("packages.expiresOn")}:{" "}
                  {formatDate(activePackage.endDate, isRtl ? "fa-IR" : "en-US")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Clock className="h-4 w-4" />
                <span>
                  {t("packages.remainingDays", {
                    count: getDaysRemaining(activePackage.endDate),
                  })}
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* درخواست‌های باقی‌مانده */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.remainingRequests")}
              </CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activePackage.requestLimit?.remaining || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.totalRequests")}:{" "}
                {activePackage.requestLimit?.monthly || 0}
              </p>

              <div className="mt-4 h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${Math.min(
                      100,
                      (activePackage.requestLimit?.remaining /
                        activePackage.requestLimit?.monthly) *
                        100 || 0
                    )}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* وضعیت SDK */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("sdk.status")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t("common.active")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("sdk.token")}: {activePackage.token.substring(0, 8)}...
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard/sdk")}
              >
                {t("sdk.manageSDK")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* پلن‌های پیشنهادی */}
      {!hasActivePlan && publicPlans && publicPlans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            {t("plans.availablePlans")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicPlans.slice(0, 3).map((plan) => (
              <Card key={plan._id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                      style: "currency",
                      currency: isRtl ? "IRR" : "USD",
                      maximumFractionDigits: 0,
                    }).format(plan.price)}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      {t("plans.duration", { duration: plan.duration })}
                    </p>
                    <p className="text-sm">
                      {t("plans.requestLimit")}:
                      {t("plans.monthly", { count: plan.requestLimit.monthly })}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/dashboard/plans/${plan._id}`)}
                  >
                    {t("plans.buyPlan")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/plans")}
            >
              {t("plans.viewAllPlans")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
