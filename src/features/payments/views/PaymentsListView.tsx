// src/features/payments/views/PaymentsListView.tsx
"use client";

import { useState, useEffect } from "react";
import { useUserPayments } from "@/api/hooks/usePayments";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentStatus } from "@/api/types/payments.types";
import { PaymentFilters } from "../components/PaymentFilters";
import { PaymentList } from "../components/PaymentList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function PaymentsListView() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Get user payments hook
  const { getUserPayments, cancelPayment, isCancelingPayment } =
    useUserPayments();

  // Get payments data
  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = getUserPayments(statusFilter);

  // Filter payments based on search term
  const filteredPayments = searchTerm.trim()
    ? payments.filter(
        (payment) =>
          payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof payment.planId === "object" &&
            payment.planId.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (payment.paymentRefId &&
            payment.paymentRefId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : payments;

  // Handle status filter change
  const handleStatusChange = (status: PaymentStatus | null) => {
    setStatusFilter(status === null ? undefined : status);
  };

  // Handle search term change
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle cancel payment
  const handleCancelPayment = async (paymentId: string) => {
    try {
      await cancelPayment(paymentId);
      refetch();
    } catch (error) {
      console.error("Error canceling payment:", error);
    }
  };

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("payments.error.title")}</AlertTitle>
        <AlertDescription>{t("payments.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("payments.title")}
        </h1>
        <p className="text-muted-foreground">{t("payments.description")}</p>
      </div>

      <PaymentFilters
        onStatusChange={handleStatusChange}
        onSearch={handleSearch}
      />

      <PaymentList
        payments={filteredPayments}
        isLoading={isLoading}
        onCancelPayment={handleCancelPayment}
        isCancelling={isCancelingPayment}
      />
    </div>
  );
}
