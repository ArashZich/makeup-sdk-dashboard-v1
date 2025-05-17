// src/features/plans/views/PlansListView.tsx
"use client";

import { useState } from "react";
import { usePlans } from "@/api/hooks/usePlans";
import { useLanguage } from "@/contexts/LanguageContext";
import { PlanCard } from "../components/PlanCard";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PlansListView() {
  const { t } = useLanguage();
  const { publicPlans, isLoadingPublicPlans, publicPlansError } = usePlans();
  const [selectedTab, setSelectedTab] = useState("all");

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

  // فیلتر کردن پلن‌ها بر اساس تب انتخاب شده
  const filteredPlans = publicPlans.filter((plan) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "special") return plan.specialOffer;
    return true;
  });

  // تعیین محبوب‌ترین پلن (با بیشترین قیمت یا به عنوان پلن ویژه)
  const getPopularPlan = () => {
    const specialOffer = publicPlans.find((plan) => plan.specialOffer);
    if (specialOffer) return specialOffer._id;

    // اگر پلن ویژه نبود، گران‌ترین پلن را به عنوان محبوب‌ترین در نظر می‌گیریم
    return publicPlans.reduce(
      (max, plan) =>
        plan.price > (publicPlans.find((p) => p._id === max)?.price || 0)
          ? plan._id
          : max,
      publicPlans[0]?._id || ""
    );
  };

  const popularPlanId = getPopularPlan();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("plans.title")}
          </h1>
          <p className="text-muted-foreground">{t("plans.description")}</p>
        </div>

        <Tabs
          defaultValue="all"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">{t("plans.allPlans")}</TabsTrigger>
            <TabsTrigger value="special">
              {t("plans.specialOffers")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            isPopular={plan._id === popularPlanId}
          />
        ))}
      </div>

      {selectedTab === "all" && filteredPlans.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t("plans.noPlansAvailable")}</p>
        </div>
      )}

      {selectedTab === "special" && filteredPlans.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {t("plans.noSpecialOffersAvailable")}
          </p>
        </div>
      )}
    </div>
  );
}
