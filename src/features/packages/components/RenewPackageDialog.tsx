// src/features/packages/components/RenewPackageDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useUserPayments } from "@/api/hooks/usePayments";
import { usePlans } from "@/api/hooks/usePlans";
import { useCoupons } from "@/api/hooks/useCoupons";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Package } from "@/api/types/packages.types";
import { Plan } from "@/api/types/plans.types";
import {
  InfoIcon,
  CheckIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  CalendarIcon,
  PackageIcon,
} from "lucide-react";
import { logger } from "@/lib/logger";

// Schema for renew form
const renewFormSchema = z.object({
  couponCode: z.string().optional(),
});

type RenewFormValues = z.infer<typeof renewFormSchema>;

interface RenewPackageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: Package;
}

export function RenewPackageDialog({
  isOpen,
  onClose,
  packageData,
}: RenewPackageDialogProps) {
  const { t, isRtl } = useLanguage();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);

  // Hooks
  const { createPayment, isCreatingPayment } = useUserPayments();
  const { publicPlans, isLoadingPublicPlans, publicPlansError } = usePlans();
  const { validateCoupon, isValidatingCoupon, validationResult } = useCoupons();

  // Load the plan details
  const planId =
    typeof packageData.planId === "string"
      ? packageData.planId
      : packageData.planId._id;

  const planName =
    typeof packageData.planId === "string"
      ? t("packages.unknownPlan")
      : packageData.planId.name;

  // Form
  const form = useForm<RenewFormValues>({
    resolver: zodResolver(renewFormSchema),
    defaultValues: {
      couponCode: "",
    },
  });

  // Set the plan when plans are loaded
  useEffect(() => {
    if (publicPlans) {
      const currentPlan = publicPlans.find((p) => p._id === planId);
      if (currentPlan) {
        setPlan(currentPlan);
        setFinalPrice(currentPlan.price);
      }
    }
  }, [publicPlans, planId]);

  // Handle coupon validation
  const handleValidateCoupon = async () => {
    if (!plan) return;

    const couponCode = form.getValues("couponCode");
    if (!couponCode) return;

    try {
      const result = await validateCoupon({
        code: couponCode,
        planId: plan._id,
      });

      if (result.valid) {
        setCouponApplied(true);
        setDiscount(result.discountAmount || 0);
        setFinalPrice(result.finalPrice || plan.price);
      } else {
        setCouponApplied(false);
        setDiscount(null);
        setFinalPrice(plan?.price || null);
      }
    } catch (error) {
      logger.error("Error validating coupon:", error);
    }
  };

  // Handle form submission
  const onSubmit = async (values: RenewFormValues) => {
    if (!plan) return;

    try {
      await createPayment({
        planId: plan._id,
        couponCode: values.couponCode || undefined,
      });
      // The useUserPayments hook will handle redirection
    } catch (error) {
      logger.error("Error creating payment:", error);
    }
  };

  // Loading state
  if (isLoadingPublicPlans || !plan) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" text="plans.loading" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (publicPlansError || !publicPlans) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>{t("plans.error.title")}</AlertTitle>
            <AlertDescription>{t("plans.error.fetchFailed")}</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("packages.renewPackage")}</DialogTitle>
          <DialogDescription>
            {t("packages.renewPackageDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Package Info */}
            <div className="bg-accent/5 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">
                {t("packages.currentPackage")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("plans.title")}:
                  </span>{" "}
                  <span className="font-medium">{planName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("packages.expiresOn")}:
                  </span>{" "}
                  <span className="font-medium">
                    {formatDate(packageData.endDate, isRtl ? "fa-IR" : "en-US")}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center text-sm">
                <RefreshCwIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                <span>{t("packages.willRenewSamePlan")}</span>
              </div>
            </div>

            {/* Coupon Code */}
            <FormField
              control={form.control}
              name="couponCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("payments.couponCode")}</FormLabel>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <FormControl>
                      <Input
                        placeholder={t("plans.enterCouponCode")}
                        {...field}
                        disabled={couponApplied}
                        className="flex-1"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidateCoupon}
                      disabled={
                        !field.value || isValidatingCoupon || couponApplied
                      }
                    >
                      {isValidatingCoupon ? (
                        <Loader size="sm" variant="spinner" />
                      ) : couponApplied ? (
                        <CheckIcon className="h-4 w-4 mr-1" />
                      ) : (
                        t("plans.applyCoupon")
                      )}
                    </Button>
                  </div>
                  {couponApplied && validationResult?.valid && (
                    <div className="mt-2 text-sm flex items-center text-green-600">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {t("plans.couponApplied")}
                    </div>
                  )}
                  {!couponApplied &&
                    validationResult &&
                    !validationResult.valid && (
                      <div className="mt-2 text-sm flex items-center text-red-600">
                        <AlertTriangleIcon className="h-4 w-4 mr-1" />
                        {t("plans.invalidCoupon")}
                      </div>
                    )}
                </FormItem>
              )}
            />

            {/* Payment Summary */}
            <div className="bg-accent/5 p-4 rounded-lg space-y-3">
              <h3 className="text-sm font-medium">
                {t("plans.purchaseSummary")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("plans.planPrice")}</span>
                  <span className="font-medium">
                    {formatCurrency(plan.price, isRtl ? "fa-IR" : "en-US")}
                  </span>
                </div>

                {discount && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("plans.discount")}</span>
                    <span>
                      - {formatCurrency(discount, isRtl ? "fa-IR" : "en-US")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>{t("plans.totalPrice")}</span>
                  <span>
                    {formatCurrency(
                      finalPrice || plan.price,
                      isRtl ? "fa-IR" : "en-US"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreatingPayment}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isCreatingPayment}>
                {isCreatingPayment ? (
                  <Loader size="sm" variant="spinner" />
                ) : (
                  t("plans.proceedToPayment")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
