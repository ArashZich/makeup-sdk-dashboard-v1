// src/features/packages/views/PackagesListView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserPackages } from "@/api/hooks/usePackages";
import { useLanguage } from "@/contexts/LanguageContext";
import { PackageCard } from "../components/PackageCard";
import { PackageStatus } from "@/api/types/packages.types";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  Package as PackageIcon,
  TimerIcon,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PackagesListView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("active");

  // Hook to get user packages with specified status
  const getPackagesByStatus = (status?: PackageStatus) => {
    return useUserPackages().getUserPackages(status);
  };

  // Get packages based on active tab
  const {
    data: packages,
    isLoading,
    error,
  } = getPackagesByStatus(activeTab as PackageStatus);

  const handleViewPackage = (packageId: string) => {
    router.push(`/dashboard/packages/${packageId}`);
  };

  const handleBuyPackage = () => {
    router.push("/dashboard/plans");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("packages.error.title")}</AlertTitle>
        <AlertDescription>{t("packages.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("packages.title")}
          </h1>
          <p className="text-muted-foreground">{t("packages.description")}</p>
        </div>

        <Button onClick={handleBuyPackage}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          {t("plans.buyPlan")}
        </Button>
      </div>

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <PackageIcon className="h-4 w-4" />
            {t("packages.tabs.active")}
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <TimerIcon className="h-4 w-4" />
            {t("packages.tabs.expired")}
          </TabsTrigger>
          <TabsTrigger value="suspended" className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            {t("packages.tabs.suspended")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {packages && packages?.results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.results.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  package={pkg}
                  onView={handleViewPackage}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                <PackageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {t("packages.noActivePackages")}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {t("packages.noActivePackagesDescription")}
              </p>
              <Button onClick={handleBuyPackage}>{t("plans.buyPlan")}</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          {packages && packages.results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.results.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  package={pkg}
                  onView={handleViewPackage}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                <TimerIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                {t("packages.noExpiredPackages")}
              </h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suspended" className="mt-6">
          {packages && packages.results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.results.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  package={pkg}
                  onView={handleViewPackage}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                <InfoIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                {t("packages.noSuspendedPackages")}
              </h3>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
