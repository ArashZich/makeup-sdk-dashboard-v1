"use client";

import { Payment } from "@/api/types/payments.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { formatCurrency, formatDate } from "@/lib";
import { Plan } from "@/api/types/plans.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Receipt, CreditCard, ClipboardCopy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useClipboard } from "@/hooks/useClipboard";
import { Badge } from "@/components/ui/badge";
import { BackButtonIcon } from "@/components/common/BackButton";

interface PaymentDetailsCardProps {
  payment: Payment;
  onCancelPayment?: () => void;
}

export function PaymentDetailsCard({
  payment,
  onCancelPayment,
}: PaymentDetailsCardProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { copyToClipboard } = useClipboard({
    successMessage: t("common.copied"),
  });

  // Handle plan type (could be a string ID or an object)
  const planName = payment.planId
    ? typeof payment.planId === "string"
      ? payment.planId
      : (payment.planId as Plan).name
    : t("common.unknown");

  // ✅ Handle coupon properly - could be string or object
  const getCouponDisplay = () => {
    if (!payment.couponId) return null;

    if (typeof payment.couponId === "string") {
      return payment.couponId;
    }

    return t("common.unknown");
  };

  const couponDisplay = getCouponDisplay();

  // Handle back button click
  const handleBackClick = () => {
    router.back();
  };

  // Copy payment ID to clipboard
  const handleCopyPaymentId = () => {
    copyToClipboard(payment._id);
  };

  // Format card number if available
  const formattedCardNumber = payment.cardNumber
    ? payment.cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4")
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BackButtonIcon onClick={handleBackClick} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">{planName}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 mt-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span>{t("payments.paymentId")}:</span>
              <span className="font-medium">{payment._id}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyPaymentId}
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </CardDescription>
          </div>

          <PaymentStatusBadge
            status={payment.status}
            className="h-fit py-1.5 px-3 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("payments.paymentDetails")}
              </h3>
              <Separator />
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.amount")}
                    </p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(
                        payment.amount,
                        isRtl ? "fa-IR" : "en-US"
                      )}
                    </p>
                  </div>

                  {payment.originalAmount &&
                    payment.originalAmount > payment.amount && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {t("payments.originalAmount")}
                        </p>
                        <p className="line-through text-muted-foreground">
                          {formatCurrency(
                            payment.originalAmount,
                            isRtl ? "fa-IR" : "en-US"
                          )}
                        </p>
                      </div>
                    )}

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.paymentDate")}
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {payment.payedDate
                        ? formatDate(
                            payment.payedDate,
                            isRtl ? "fa-IR" : "en-US"
                          )
                        : formatDate(
                            payment.createdAt,
                            isRtl ? "fa-IR" : "en-US"
                          )}
                    </p>
                  </div>

                  {payment.couponId && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {t("payments.discount")}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-green-600 bg-green-50 border-green-200"
                      >
                        {payment.originalAmount
                          ? formatCurrency(
                              payment.originalAmount - payment.amount,
                              isRtl ? "fa-IR" : "en-US"
                            )
                          : "-"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(payment.cardNumber || payment.cardHashPan) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("payments.paymentMethod")}
                </h3>
                <Separator />
                <div className="pt-2 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.cardNumber")}
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">
                        {formattedCardNumber || payment.cardHashPan || "-"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("payments.referenceInformation")}
              </h3>
              <Separator />
              <div className="space-y-4 pt-2">
                {payment.paymentRefId && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.paymentRefId")}
                    </p>
                    <p className="font-medium">{payment.paymentRefId}</p>
                  </div>
                )}

                {payment.clientRefId && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.clientRefId")}
                    </p>
                    <p className="font-medium">{payment.clientRefId}</p>
                  </div>
                )}

                {payment.paymentCode && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.paymentCode")}
                    </p>
                    <p className="font-medium">{payment.paymentCode}</p>
                  </div>
                )}

                {/* ✅ Fixed coupon display */}
                {couponDisplay && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("payments.couponCode")}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {couponDisplay}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {payment.status === "pending" && onCancelPayment && (
              <div className="pt-4">
                <Button
                  variant="destructive"
                  onClick={onCancelPayment}
                  className="w-full"
                >
                  {t("payments.cancelPayment")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
