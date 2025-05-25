"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { Payment } from "@/api/types/payments.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";
import { Copy, User as UserIcon, Package, CreditCard } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
}: PaymentDetailsModalProps) {
  const { t } = useLanguage();
  const { copyToClipboard } = useClipboard();

  if (!payment) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const userInfo =
    typeof payment.userId === "string"
      ? { name: payment.userId, phone: "" }
      : (payment.userId as User);

  const planInfo =
    typeof payment.planId === "string"
      ? { name: payment.planId, price: 0, duration: 0 }
      : (payment.planId as Plan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mt-4">
            <CreditCard className="h-5 w-5" />
            {t("admin.payments.details.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.payments.table.paymentId")}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm">
                  {payment.clientRefId || payment._id.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    copyToClipboard(payment.clientRefId || payment._id)
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.payments.table.status")}
              </label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(payment.status)}>
                  {t(`admin.payments.status.${payment.status}`)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="h-4 w-4" />
              <h3 className="font-medium">
                {t("admin.payments.details.userInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.details.nameLabel")}
                </label>
                <p className="mt-1">{userInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.details.phoneLabel")}
                </label>
                <p className="mt-1">{userInfo.phone || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4" />
              <h3 className="font-medium">
                {t("admin.payments.details.planInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("plans.title")}
                </label>
                <p className="mt-1">{planInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("plans.price")}
                </label>
                <p className="mt-1">{formatCurrency(planInfo.price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.details.duration")}
                </label>
                <p className="mt-1">
                  {planInfo.duration} {t("common.days")}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div>
            <h3 className="font-medium mb-3">
              {t("admin.payments.details.paymentDetails")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.table.amount")}
                </label>
                <div className="mt-1">
                  <p className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.originalAmount &&
                    payment.originalAmount !== payment.amount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatCurrency(payment.originalAmount)}
                      </p>
                    )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.details.discount")}
                </label>
                <p className="mt-1">
                  {payment.originalAmount &&
                  payment.originalAmount !== payment.amount
                    ? formatCurrency(payment.originalAmount - payment.amount)
                    : "-"}
                </p>
              </div>
              {payment.paymentCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("admin.payments.table.paymentCode")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">
                      {payment.paymentCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(payment.paymentCode!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {payment.paymentRefId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("admin.payments.table.refId")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">
                      {payment.paymentRefId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(payment.paymentRefId!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="font-medium mb-3">
              {t("admin.payments.details.dates")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.payments.details.createdAt")}
                </label>
                <p className="mt-1">{formatDate(payment.createdAt)}</p>
              </div>
              {payment.payedDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("admin.payments.details.paidAt")}
                  </label>
                  <p className="mt-1">{formatDate(payment.payedDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
