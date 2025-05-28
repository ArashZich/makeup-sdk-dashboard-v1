// src/features/plans/views/PlanDetailsView.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePlans } from "@/api/hooks/usePlans";
import { useCoupons } from "@/api/hooks/useCoupons";
import { useUserPayments } from "@/api/hooks/usePayments";
import { useUserProfile } from "@/api/hooks/useUsers"; // 🆕 جدید
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookies } from "@/lib/cookies";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Check,
  InfoIcon,
  TagIcon,
  X,
  Globe,
  AlertTriangle,
  Smartphone,
  Clock,
  Zap,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { BackButtonIcon } from "@/components/common/BackButton";
import { RequiredInfoDialog } from "@/components/dialogs/RequiredInfoDialog"; // 🆕 جدید
import { TargetPlatform } from "@/api/types/plans.types";
import { useBoolean } from "@/hooks/useBoolean";

interface PlanDetailsViewProps {
  planId: string;
}

export function PlanDetailsView({ planId }: PlanDetailsViewProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { getCookie } = useCookies();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const { getValue, setFalse, setTrue } = useBoolean({
    showRequiredInfoDialog: false,
  });

  // React Query hooks
  const { getPlan, isPlanAvailableForPlatform } = usePlans();
  const { validateCoupon, isValidatingCoupon } = useCoupons();
  const { createPayment, isCreatingPayment } = useUserPayments();
  const { profile } = useUserProfile(); // 🆕 جدید

  const { data: plan, isLoading, error } = getPlan(planId);

  // تشخیص پلتفرم کاربر
  const userPlatform: TargetPlatform = useMemo(() => {
    const userRole = getCookie("user_role");
    const divarToken = getCookie("divar_token");

    if (divarToken) return "divar";
    if (userRole === "divar_user") return "divar";
    return "normal";
  }, [getCookie]);

  // بررسی سازگاری پلن
  const isCompatible = useMemo(() => {
    if (!plan) return false;
    return isPlanAvailableForPlatform(plan, userPlatform);
  }, [plan, userPlatform, isPlanAvailableForPlatform]);

  // 🆕 محاسبه مالیات
  const taxCalculation = useMemo(() => {
    const baseAmount = appliedCoupon
      ? appliedCoupon.finalPrice
      : plan?.price || 0;
    const taxAmount = Math.floor(baseAmount * 0.1); // 10% مالیات
    const finalAmountWithTax = baseAmount + taxAmount;

    return {
      baseAmount,
      taxAmount,
      finalAmountWithTax,
    };
  }, [plan?.price, appliedCoupon]);

  // 🆕 بررسی اطلاعات ضروری
  const hasRequiredInfo = useMemo(() => {
    return profile?.userType && profile?.nationalId;
  }, [profile]);

  // فرمت کردن تعداد requests
  const formatRequestLimit = (total: number) => {
    if (total === -1) return t("common.unlimited");
    return total.toLocaleString(isRtl ? "fa-IR" : "en-US");
  };

  // نمایش پلتفرم‌های پشتیبانی شده
  const renderTargetPlatforms = () => {
    if (!plan) return null;

    if (plan.targetPlatforms.includes("all")) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-4 w-4" />
          {t("plans.allPlatforms")}
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {plan.targetPlatforms.map((platform) => (
          <Badge
            key={platform}
            variant={platform === userPlatform ? "default" : "outline"}
            className="gap-1"
          >
            <Smartphone className="h-3 w-3" />
            {t(`plans.platforms.${platform}`)}
          </Badge>
        ))}
      </div>
    );
  };

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

    if (!isCompatible) {
      showToast.error(t("plans.incompatiblePlatformError"));
      return;
    }

    // 🆕 بررسی اطلاعات ضروری
    if (!hasRequiredInfo) {
      setTrue("showRequiredInfoDialog");
      return;
    }

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

  // 🆕 handle موفقیت dialog
  const handleRequiredInfoSuccess = () => {
    setFalse("showRequiredInfoDialog");
    // اجرای مجدد پرداخت
    handlePurchase();
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

      {/* هشدار عدم سازگاری */}
      {!isCompatible && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("plans.incompatiblePlan")}</AlertTitle>
          <AlertDescription>
            {t("plans.incompatiblePlanDescription", {
              userPlatform: t(`plans.platforms.${userPlatform}`),
              supportedPlatforms: plan.targetPlatforms
                .map((p) => t(`plans.platforms.${p}`))
                .join(", "),
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* جزئیات پلن */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  {plan.specialOffer && (
                    <Badge variant="destructive">
                      {t("plans.specialOffer")}
                    </Badge>
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

              {/* مشخصات کلیدی */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t("common.duration")}
                  </div>
                  <div className="font-medium">
                    {t("plans.durationDays", { days: plan.duration })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    {t("plans.totalRequests")}
                  </div>
                  <div className="font-medium">
                    {formatRequestLimit(plan.requestLimit.total)}
                  </div>
                </div>
              </div>

              {/* پلتفرم‌های پشتیبانی شده */}
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {t("plans.targetPlatforms")}:
                </div>
                {renderTargetPlatforms()}

                {/* نمایش پلتفرم کاربر */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("plans.yourPlatform")}:
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <Smartphone className="h-3 w-3" />
                    {t(`plans.platforms.${userPlatform}`)}
                  </Badge>
                  {isCompatible ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-green-100 text-green-800"
                    >
                      <Check className="h-3 w-3" />
                      {t("plans.compatible")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-red-100 text-red-800"
                    >
                      <X className="h-3 w-3" />
                      {t("plans.incompatible")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* ویژگی‌ها */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">{t("plans.features")}:</p>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
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

                {/* 🆕 نمایش مالیات */}
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    {t("payments.tax")}
                    <span className="text-xs">({t("payments.taxRate")})</span>
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                      style: "currency",
                      currency: isRtl ? "IRR" : "USD",
                      maximumFractionDigits: 0,
                    }).format(taxCalculation.taxAmount)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>{t("payments.finalAmountWithTax")}</span>
                    <span>
                      {new Intl.NumberFormat(isRtl ? "fa-IR" : "en-US", {
                        style: "currency",
                        currency: isRtl ? "IRR" : "USD",
                        maximumFractionDigits: 0,
                      }).format(taxCalculation.finalAmountWithTax)}
                    </span>
                  </div>
                </div>
              </div>

              {/* بخش کد تخفیف */}
              {isCompatible && (
                <>
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <Label htmlFor="coupon-code">
                        {t("plans.couponCode")}
                      </Label>
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
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handlePurchase}
                disabled={isCreatingPayment || !isCompatible}
                variant={isCompatible ? "default" : "secondary"}
              >
                {isCreatingPayment ? (
                  <Loader size="sm" variant="spinner" />
                ) : isCompatible ? (
                  t("plans.proceedToPayment")
                ) : (
                  t("plans.incompatiblePlatform")
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 🆕 Dialog اطلاعات ضروری */}
      <RequiredInfoDialog
        isOpen={getValue("showRequiredInfoDialog")}
        onClose={() => setFalse("showRequiredInfoDialog")}
        onSuccess={handleRequiredInfoSuccess}
      />
    </div>
  );
}
