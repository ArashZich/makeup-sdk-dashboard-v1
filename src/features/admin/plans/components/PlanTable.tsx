// src/features/admin/plans/components/PlanTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plan } from "@/api/types/plans.types";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Star,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface PlanTableProps {
  plans: Plan[];
  onDeletePlan: (plan: Plan) => void;
}

export function PlanTable({ plans, onDeletePlan }: PlanTableProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{plan.name}</span>
            {plan.specialOffer && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              >
                <Star className="mr-1 h-3 w-3" /> {t("plans.specialOffer")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: t("payments.amount"),
      cell: ({ row }) =>
        formatCurrency(row.original.price, isRtl ? "fa-IR" : "en-US"),
    },
    {
      accessorKey: "duration",
      header: t("plans.duration", { duration: "" }),
      cell: ({ row }) =>
        t("plans.duration", { duration: row.original.duration }),
    },
    {
      accessorKey: "requestLimit.monthly",
      header: t("plans.requestLimit"),
      cell: ({ row }) =>
        row.original.requestLimit.monthly.toLocaleString(
          isRtl ? "fa-IR" : "en-US"
        ),
    },
    {
      accessorKey: "active",
      header: t("common.status"),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.active ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-green-500">{t("common.active")}</span>
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">{t("common.inactive")}</span>
            </>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const plan = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("common.actions")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/admin/plans/${plan._id}`)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/admin/plans/edit/${plan._id}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeletePlan(plan)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={plans}
      searchKey="name"
      searchPlaceholder={t("plans.search")}
      noResultsText={t("plans.noPlans")}
    />
  );
}
