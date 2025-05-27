// src/features/plans/components/PlanCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/api/hooks/usePlans";
import { Plan, TargetPlatform } from "@/api/types/plans.types";
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
import { Check, Globe, Smartphone } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
  isPopular?: boolean;
  className?: string;
  userPlatform?: TargetPlatform; // پلتفرم فعلی کاربر
}

export function PlanCard({
  plan,
  isPopular,
  className,
  userPlatform = "normal",
}: PlanCardProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { isPlanAvailableForPlatform } = usePlans();

  const handleBuyClick = () => {
    router.push(`/dashboard/plans/${plan._id}`);
  };

  // بررسی سازگاری پلن با پلتفرم کاربر
  const isCompatible = isPlanAvailableForPlatform(plan, userPlatform);

  // تابع نمایش پلتفرم‌ها
  const renderTargetPlatforms = () => {
    if (plan.targetPlatforms.includes("all")) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" />
          {t("plans.allPlatforms")}
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {plan.targetPlatforms.map((platform) => (
          <Badge key={platform} variant="outline" className="text-xs">
            {t(`plans.platforms.${platform}`)}
          </Badge>
        ))}
      </div>
    );
  };

  // فرمت کردن تعداد requests
  const formatRequestLimit = (total: number) => {
    if (total === -1) return t("common.unlimited");
    return total.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  return (
    <Card
      className={`${className} overflow-hidden relative ${
        !isCompatible ? "opacity-60" : ""
      }`}
    >
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
          <div className="flex flex-col gap-2">
            {isPopular && (
              <Badge variant="secondary">{t("plans.popular")}</Badge>
            )}
            {plan.specialOffer && (
              <Badge variant="destructive">{t("plans.specialOffer")}</Badge>
            )}
            {!isCompatible && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {t("plans.incompatible")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* قیمت */}
        <div className="text-3xl font-bold">
          {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
            style: "currency",
            currency: isRtl ? "IRR" : "USD",
            maximumFractionDigits: 0,
          }).format(plan.price)}
        </div>

        {/* اطلاعات پایه */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("common.duration")}:
            </span>
            <span className="font-medium">
              {t("plans.durationDays", { days: plan.duration })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("plans.totalRequests")}:
            </span>
            <span className="font-medium">
              {formatRequestLimit(plan.requestLimit.total)}
            </span>
          </div>
        </div>

        {/* پلتفرم‌های پشتیبانی شده */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("plans.targetPlatforms")}:</p>
          {renderTargetPlatforms()}
        </div>

        {/* ویژگی‌ها */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">{t("plans.features")}:</p>
          <ul className="space-y-2 max-h-32 overflow-y-auto">
            {plan.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
            {plan.features.length > 4 && (
              <li className="text-xs text-muted-foreground">
                {t("plans.andMoreFeatures", {
                  count: plan.features.length - 4,
                })}
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBuyClick}
          disabled={!isCompatible}
          variant={isCompatible ? "default" : "secondary"}
        >
          {isCompatible ? t("plans.buyPlan") : t("plans.notAvailable")}
        </Button>
      </CardFooter>
    </Card>
  );
}
