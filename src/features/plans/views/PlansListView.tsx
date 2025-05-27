// src/features/plans/views/PlansListView.tsx
"use client";

import { useState, useMemo } from "react";
import { usePlans } from "@/api/hooks/usePlans";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookies } from "@/lib/cookies";
import { PlanCard } from "../components/PlanCard";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Filter, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TargetPlatform } from "@/api/types/plans.types";

export function PlansListView() {
  const { t } = useLanguage();
  const { getCookie } = useCookies();
  const [selectedTab, setSelectedTab] = useState("compatible");

  const {
    publicPlans,
    isLoadingPublicPlans,
    publicPlansError,
    filterPlansByPlatform,
    getSpecialOfferPlans,
    groupPlansByPlatform,
  } = usePlans();

  // تشخیص پلتفرم کاربر
  const userPlatform: TargetPlatform = useMemo(() => {
    const userRole = getCookie("user_role");
    const divarToken = getCookie("divar_token");

    if (divarToken) return "divar";
    if (userRole === "divar_user") return "divar";
    return "normal";
  }, [getCookie]);

  // پردازش پلن‌ها
  const processedPlans = useMemo(() => {
    if (!publicPlans) return null;

    const compatiblePlans = filterPlansByPlatform(publicPlans, userPlatform);
    const specialOffers = getSpecialOfferPlans(publicPlans);
    const compatibleSpecialOffers = getSpecialOfferPlans(compatiblePlans);
    const groupedPlans = groupPlansByPlatform(publicPlans);

    return {
      all: publicPlans,
      compatible: compatiblePlans,
      specialOffers,
      compatibleSpecialOffers,
      grouped: groupedPlans,
      stats: {
        total: publicPlans.length,
        compatible: compatiblePlans.length,
        specialOffers: specialOffers.length,
        platforms: Object.keys(groupedPlans).length,
      },
    };
  }, [
    publicPlans,
    userPlatform,
    filterPlansByPlatform,
    getSpecialOfferPlans,
    groupPlansByPlatform,
  ]);

  // تعیین محبوب‌ترین پلن
  const getPopularPlan = (plans: any[]) => {
    if (!plans.length) return null;

    // اولویت: پلن ویژه سازگار با پلتفرم کاربر
    const compatibleSpecial = plans.find(
      (plan) =>
        plan.specialOffer &&
        (plan.targetPlatforms.includes("all") ||
          plan.targetPlatforms.includes(userPlatform))
    );

    if (compatibleSpecial) return compatibleSpecial._id;

    // اولویت دوم: گران‌ترین پلن سازگار
    const compatiblePlans = plans.filter(
      (plan) =>
        plan.targetPlatforms.includes("all") ||
        plan.targetPlatforms.includes(userPlatform)
    );

    if (compatiblePlans.length > 0) {
      return compatiblePlans.reduce((max, plan) =>
        plan.price > max.price ? plan : max
      )._id;
    }

    // در نهایت هر پلنی
    return plans[0]._id;
  };

  // فیلتر کردن پلن‌ها بر اساس تب انتخاب شده
  const getFilteredPlans = () => {
    if (!processedPlans) return [];

    switch (selectedTab) {
      case "all":
        return processedPlans.all;
      case "compatible":
        return processedPlans.compatible;
      case "special":
        return processedPlans.specialOffers;
      default:
        return processedPlans.compatible;
    }
  };

  const filteredPlans = getFilteredPlans();
  const popularPlanId = getPopularPlan(filteredPlans);

  if (isLoadingPublicPlans) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (publicPlansError || !publicPlans || publicPlans.length === 0) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("plans.error.title")}</AlertTitle>
        <AlertDescription>
          {publicPlansError
            ? t("plans.error.fetchFailed")
            : t("plans.error.noPlansAvailable")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("plans.title")}
          </h1>
          <p className="text-muted-foreground">{t("plans.description")}</p>

          {/* نمایش پلتفرم کاربر */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="gap-1">
              <Filter className="h-3 w-3" />
              {t("plans.yourPlatform")}: {t(`plans.platforms.${userPlatform}`)}
            </Badge>
            {processedPlans && (
              <Badge variant="secondary">
                {processedPlans.stats.compatible} {t("plans.compatiblePlans")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      {processedPlans && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {processedPlans.stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.totalPlans")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {processedPlans.stats.compatible}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.compatiblePlans")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {processedPlans.stats.specialOffers}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.specialOffers")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {processedPlans.stats.platforms}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("plans.supportedPlatforms")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تب‌های فیلتر */}
      <Tabs
        defaultValue="compatible"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="compatible" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            {t("plans.compatiblePlans")}
          </TabsTrigger>
          <TabsTrigger value="all">{t("plans.allPlans")}</TabsTrigger>
          <TabsTrigger value="special">{t("plans.specialOffers")}</TabsTrigger>
        </TabsList>

        {/* محتوای تب پلن‌های سازگار */}
        <TabsContent value="compatible" className="mt-6">
          {processedPlans?.compatible &&
          processedPlans.compatible.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processedPlans.compatible.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  isPopular={plan._id === popularPlanId}
                  userPlatform={userPlatform}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {t("plans.noCompatiblePlans")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* محتوای تب همه پلن‌ها */}
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicPlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                isPopular={plan._id === popularPlanId}
                userPlatform={userPlatform}
              />
            ))}
          </div>
        </TabsContent>

        {/* محتوای تب پیشنهادات ویژه */}
        <TabsContent value="special" className="mt-6">
          {processedPlans?.specialOffers &&
          processedPlans.specialOffers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processedPlans.specialOffers.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  isPopular={plan._id === popularPlanId}
                  userPlatform={userPlatform}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {t("plans.noSpecialOffersAvailable")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* پیام راهنما */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            {t("plans.platformInfo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-800 dark:text-blue-200">
            {t("plans.platformInfo.description", {
              platform: t(`plans.platforms.${userPlatform}`),
            })}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
