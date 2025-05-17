"use client";

import { Payment } from "@/api/types/payments.types";
import { PaymentCard } from "./PaymentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { CancelPaymentDialog } from "./CancelPaymentDialog";
import { Loader } from "@/components/common/Loader";
import { Receipt } from "lucide-react";

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
  onCancelPayment: (paymentId: string) => Promise<void>;
  isCancelling: boolean;
}

export function PaymentList({
  payments,
  isLoading,
  onCancelPayment,
  isCancelling,
}: PaymentListProps) {
  const { t } = useLanguage();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Handle cancel payment click
  const handleCancelPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowCancelDialog(true);
  };

  // Handle confirm cancel
  const handleConfirmCancel = async () => {
    if (selectedPayment) {
      await onCancelPayment(selectedPayment._id);
      setShowCancelDialog(false);
      setSelectedPayment(null);
    }
  };

  // Handle cancel dialog close
  const handleCancelDialog = () => {
    setShowCancelDialog(false);
    setSelectedPayment(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" text="payments.loading" />
      </div>
    );
  }

  // Empty state
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium">{t("payments.noPaymentsFound")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("payments.noPaymentsFoundDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map((payment) => (
          <PaymentCard
            key={payment._id}
            payment={payment}
            showCancelButton={payment.status === "pending"}
            onCancelPayment={handleCancelPayment}
          />
        ))}
      </div>

      <CancelPaymentDialog
        payment={selectedPayment}
        isOpen={showCancelDialog}
        isLoading={isCancelling}
        onCancel={handleCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
