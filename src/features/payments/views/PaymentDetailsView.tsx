"use client";

import { useState } from "react";
import { useUserPayments } from "@/api/hooks/usePayments";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentDetailsCard } from "../components/PaymentDetailsCard";
import { CancelPaymentDialog } from "../components/CancelPaymentDialog";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PaymentDetailsViewProps {
  paymentId: string;
}

export function PaymentDetailsView({ paymentId }: PaymentDetailsViewProps) {
  const { t } = useLanguage();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Get payment details hook
  const { getPayment, cancelPayment, isCancelingPayment } = useUserPayments();

  // Get payment data
  const { data: payment, isLoading, error, refetch } = getPayment(paymentId);

  // Handle cancel payment click
  const handleCancelPayment = () => {
    setShowCancelDialog(true);
  };

  // Handle confirm cancel payment
  const handleConfirmCancel = async () => {
    if (!payment) return;

    try {
      await cancelPayment(payment._id);
      setShowCancelDialog(false);
      refetch();
    } catch (error) {
      console.error("Error canceling payment:", error);
    }
  };

  // Handle cancel dialog close
  const handleCancelDialog = () => {
    setShowCancelDialog(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" text="payments.loading" />
      </div>
    );
  }

  // Error state
  if (error || !payment) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("payments.error.title")}</AlertTitle>
        <AlertDescription>
          {t("payments.error.paymentNotFound")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PaymentDetailsCard
        payment={payment}
        onCancelPayment={
          payment.status === "pending" ? handleCancelPayment : undefined
        }
      />

      <CancelPaymentDialog
        payment={payment}
        isOpen={showCancelDialog}
        isLoading={isCancelingPayment}
        onCancel={handleCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
