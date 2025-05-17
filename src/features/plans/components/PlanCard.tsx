// src/features/plans/components/PlanCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plan } from "@/api/types/plans.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
  isPopular?: boolean;
  className?: string;
}

export function PlanCard({ plan, isPopular, className }: PlanCardProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  const handleBuyClick = () => {
    router.push(`/dashboard/plans/${plan._id}`);
  };

  return (
    <Card className={`${className} overflow-hidden relative`}>
      {isPopular && (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-primary" />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription className="mt-1.5">
              {plan.description}
            </CardDescription>
          </div>
          {isPopular && (
            <Badge variant="secondary" className="ml-2">
              {t("plans.popular")}
            </Badge>
          )}
          {plan.specialOffer && (
            <Badge variant="destructive" className="ml-2">
              {t("plans.specialOffer")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-3">
          <p className="text-sm font-semibold">{t("plans.features")}:</p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleBuyClick}>
          {t("plans.buyPlan")}
        </Button>
      </CardFooter>
    </Card>
  );
}
