"use client";

import { Payment } from "@/api/types/payments.types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";
import { Calendar, Receipt, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentCardProps {
  payment: Payment;
  showCancelButton?: boolean;
  onCancelPayment?: (payment: Payment) => void;
}

export function PaymentCard({
  payment,
  showCancelButton = true,
  onCancelPayment,
}: PaymentCardProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

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

  // Handle view details click
  const handleViewDetails = () => {
    router.push(`/dashboard/payments/${payment._id}`);
  };

  // Handle cancel payment click
  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancelPayment) {
      onCancelPayment(payment);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:border-primary/20">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{planName}</CardTitle>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <CardDescription className="flex items-center gap-1.5 mt-1">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">{payment._id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("payments.amount")}
            </p>
            <p className="font-semibold">
              {formatCurrency(payment.amount, isRtl ? "fa-IR" : "en-US")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("payments.paymentDate")}
            </p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {payment.payedDate
                ? formatDate(payment.payedDate, isRtl ? "fa-IR" : "en-US")
                : formatDate(payment.createdAt, isRtl ? "fa-IR" : "en-US")}
            </p>
          </div>
          {/* ✅ Fixed coupon display */}
          {couponDisplay && (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("payments.originalAmount")}
                </p>
                <p className="line-through text-muted-foreground">
                  {formatCurrency(
                    payment.originalAmount || payment.amount,
                    isRtl ? "fa-IR" : "en-US"
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t("payments.discount")}
                </p>
                <p className="text-green-600">
                  {payment.originalAmount
                    ? formatCurrency(
                        payment.originalAmount - payment.amount,
                        isRtl ? "fa-IR" : "en-US"
                      )
                    : "—"}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-3 pt-3 flex justify-end gap-2">
        {payment.status === "pending" && showCancelButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelClick}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            {t("payments.cancelPayment")}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="gap-1.5"
        >
          {t("payments.viewPaymentDetails")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
