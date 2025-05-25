// src/features/plans/views/PlanDetailsView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlans } from "@/api/hooks/usePlans";
import { useCoupons } from "@/api/hooks/useCoupons";
import { useUserPayments } from "@/api/hooks/usePayments";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, InfoIcon, TagIcon, X } from "lucide-react";
import { showToast } from "@/lib/toast";
import { BackButtonIcon } from "@/components/common/BackButton";

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  // React Query hooks
  const { getPlan } = usePlans();
  const { validateCoupon, isValidatingCoupon } = useCoupons();
  const { createPayment, isCreatingPayment } = useUserPayments();

  const { data: plan, isLoading, error } = getPlan(planId);

  const handleCouponApply = async () => {
    if (!couponCode.trim() || !plan) return;

    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon({
        code: couponCode,
        planId,
      });

      if (result.valid && result.discountAmount && result.finalPrice) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: result.discountAmount,
          finalPrice: result.finalPrice,
        });
        showToast.success(t("plans.couponAppliedSuccessfully"));
      } else {
        showToast.error(t("plans.invalidCoupon"));
      }
    } catch (error) {
      showToast.error(t("plans.couponValidationFailed"));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePurchase = async () => {
    if (!plan) return;

    try {
      const response = await createPayment({
        planId,
        couponCode: appliedCoupon?.code,
      });

      // باز کردن درگاه پرداخت
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      showToast.error(t("payments.paymentInitFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("plans.error.title")}</AlertTitle>
        <AlertDescription>{t("plans.error.planNotFound")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BackButtonIcon onClick={() => router.back()} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* جزئیات پلن */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
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
          </Card>
        </div>

        {/* فرم خرید */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("plans.purchaseSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t("plans.planPrice")}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                      style: "currency",
                      currency: isRtl ? "IRR" : "USD",
                      maximumFractionDigits: 0,
                    }).format(plan.price)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-destructive">
                    <span>{t("plans.discount")}</span>
                    <span className="font-medium">
                      -
                      {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                        style: "currency",
                        currency: isRtl ? "IRR" : "USD",
                        maximumFractionDigits: 0,
                      }).format(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>{t("plans.totalPrice")}</span>
                    <span>
                      {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                        style: "currency",
                        currency: isRtl ? "IRR" : "USD",
                        maximumFractionDigits: 0,
                      }).format(
                        appliedCoupon ? appliedCoupon.finalPrice : plan.price
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* بخش کد تخفیف */}
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">{t("plans.couponCode")}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="coupon-code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-9"
                        placeholder={t("plans.enterCouponCode")}
                        disabled={isApplyingCoupon}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCouponApply}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                    >
                      {isApplyingCoupon ? (
                        <Loader size="sm" variant="spinner" />
                      ) : (
                        t("plans.applyCoupon")
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-md p-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium block">
                      {t("plans.couponApplied")}: {appliedCoupon.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("plans.discountAmount")}:
                      {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                        style: "currency",
                        currency: isRtl ? "IRR" : "USD",
                        maximumFractionDigits: 0,
                      }).format(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handlePurchase}
                disabled={isCreatingPayment}
              >
                {isCreatingPayment ? (
                  <Loader size="sm" variant="spinner" />
                ) : (
                  t("plans.proceedToPayment")
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
