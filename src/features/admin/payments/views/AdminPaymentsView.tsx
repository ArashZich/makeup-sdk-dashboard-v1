"use client";

import { useState, useMemo } from "react";
import { useAdminPayments } from "@/api/hooks/usePayments";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Download } from "lucide-react";
import { PaymentStatsCards } from "../components/PaymentStatsCards";
import { PaymentTable } from "../components/PaymentTable";
import { PaymentFilters } from "../components/PaymentFilters";
import { PaymentStatus } from "@/api/types/payments.types";

export function AdminPaymentsView() {
  const { t } = useLanguage();

  const [filters, setFilters] = useState<{
    status?: PaymentStatus;
    planId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
  }>({});

  // Fetch payments with filters
  const { getAllPayments } = useAdminPayments();

  const apiFilters = useMemo(() => {
    const result: any = {};

    if (filters.status) {
      result.status = filters.status;
    }
    if (filters.planId) {
      result.planId = filters.planId;
    }
    if (filters.userId) {
      result.userId = filters.userId;
    }

    return result;
  }, [filters]);

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = getAllPayments(apiFilters);

  const payments = paymentsData?.results || [];

  // Client-side filtering for amount range
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(
        (payment) => payment.amount >= filters.minAmount!
      );
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(
        (payment) => payment.amount <= filters.maxAmount!
      );
    }

    return filtered;
  }, [payments, filters.minAmount, filters.maxAmount]);

  const handleRefresh = () => {
    refetch();
  };

  const handleExportPayments = () => {
    // TODO: Export payments functionality
    console.log("Export payments:", filteredPayments);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                {t("common.error.general")}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("common.refresh")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.payments.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.payments.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportPayments}
            variant="outline"
            size="sm"
            disabled={filteredPayments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t("common.export")}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Payment Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("dashboard.overview")}</h2>
        <PaymentStatsCards payments={filteredPayments} isLoading={isLoading} />
      </div>

      {/* Filters */}
      <PaymentFilters onFiltersChange={setFilters} />

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("admin.payments.allPayments")}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {t("common.showing")} {filteredPayments.length} {t("common.of")}{" "}
              {payments.length} {t("admin.payments.allPayments")}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PaymentTable payments={filteredPayments} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
