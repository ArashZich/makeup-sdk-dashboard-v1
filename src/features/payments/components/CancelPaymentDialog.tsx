"use client";

import { Payment } from "@/api/types/payments.types";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plan } from "@/api/types/plans.types";
import { AlertCircle } from "lucide-react";

interface CancelPaymentDialogProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CancelPaymentDialog({
  payment,
  isOpen,
  isLoading,
  onCancel,
  onConfirm,
}: CancelPaymentDialogProps) {
  const { t } = useLanguage();

  if (!payment) return null;

  // Handle plan type (could be a string ID or an object)
  const planName = payment.planId
    ? typeof payment.planId === "string"
      ? payment.planId
      : (payment.planId as Plan).name
    : t("common.unknown");

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader className="gap-2">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <AlertDialogTitle>
            {t("payments.confirmCancelPayment")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("payments.cancelPendingPayment")} <strong>{planName}</strong>.{" "}
            {t("common.confirm")}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("common.loading")}
              </span>
            ) : (
              t("payments.cancelPayment")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
