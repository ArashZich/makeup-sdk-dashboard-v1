"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { Payment } from "@/api/types/payments.types";
import { User } from "@/api/types/users.types";
import { Plan } from "@/api/types/plans.types";
import { Eye, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { PaymentDetailsModal } from "./PaymentDetailsModal";

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
}

export function PaymentTable({ payments, isLoading }: PaymentTableProps) {
  const { t } = useLanguage();
  const { copyToClipboard } = useClipboard();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

  const handleCopyPaymentCode = (code: string) => {
    copyToClipboard(code);
  };

  const getUserInfo = (payment: Payment) => {
    if (typeof payment.userId === "string") {
      return payment.userId;
    }
    const user = payment.userId as User;
    return {
      name: user.name,
      phone: user.phone,
    };
  };

  const getPlanInfo = (payment: Payment) => {
    if (typeof payment.planId === "string") {
      return payment.planId;
    }
    const plan = payment.planId as Plan;
    return {
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
    };
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "clientRefId",
      header: () => t("admin.payments.table.paymentId"),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.clientRefId || row.original._id.slice(-8)}
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: () => t("admin.payments.table.user"),
      cell: ({ row }) => {
        const userInfo = getUserInfo(row.original);
        if (typeof userInfo === "string") {
          return (
            <div className="text-sm text-muted-foreground">{userInfo}</div>
          );
        }
        return (
          <div>
            <div className="font-medium text-sm">{userInfo.name}</div>
            <div className="text-xs text-muted-foreground">
              {userInfo.phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "planId",
      header: () => t("admin.payments.table.plan"),
      cell: ({ row }) => {
        const planInfo = getPlanInfo(row.original);
        if (typeof planInfo === "string") {
          return (
            <div className="text-sm text-muted-foreground">{planInfo}</div>
          );
        }
        return (
          <div>
            <div className="font-medium text-sm">{planInfo.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(planInfo.price)} • {planInfo.duration}{" "}
              {t("common.days")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => t("admin.payments.table.amount"),
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold">
            {formatCurrency(row.original.amount)}
          </div>
          {row.original.originalAmount &&
            row.original.originalAmount !== row.original.amount && (
              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(row.original.originalAmount)}
              </div>
            )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => t("admin.payments.table.status"),
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {t(`admin.payments.status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentCode",
      header: () => t("admin.payments.table.paymentCode"),
      cell: ({ row }) => {
        if (!row.original.paymentCode) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">
              {row.original.paymentCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopyPaymentCode(row.original.paymentCode!)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => t("admin.payments.table.date"),
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.createdAt)}</div>
          {row.original.payedDate && (
            <div className="text-xs text-muted-foreground">
              {t("payments.paidAt")}: {formatDate(row.original.payedDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => t("common.actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setSelectedPayment(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">{t("common.view")}</span>
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={payments}
        searchKey="clientRefId"
        searchPlaceholder={t("admin.payments.searchPlaceholder")}
        noResultsText={t("admin.payments.noPayments")}
        pagination={true}
        pageSize={10}
      />

      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </>
  );
}
