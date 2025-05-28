// src/features/admin/coupons/components/CouponTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coupon } from "@/api/types/coupons.types";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib";
import {
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  Users,
  Infinity,
} from "lucide-react";

interface CouponTableProps {
  coupons: Coupon[];
  onDeleteCoupon: (coupon: Coupon) => void;
}

export function CouponTable({ coupons, onDeleteCoupon }: CouponTableProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: t("admin.coupons.code"),
      cell: ({ row }) => (
        <div className="font-mono font-medium uppercase">
          {row.original.code}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: t("common.description"),
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.original.description}
        >
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "percent",
      header: t("admin.coupons.discountPercent"),
      cell: ({ row }) => (
        <div className="flex items-center">
          <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
          {row.original.percent}%
        </div>
      ),
    },
    {
      accessorKey: "maxAmount",
      header: t("admin.coupons.maxAmount"),
      cell: ({ row }) =>
        formatCurrency(row.original.maxAmount, isRtl ? "fa-IR" : "en-US"),
    },
    {
      accessorKey: "usedCount",
      header: t("admin.coupons.usedCount"),
      cell: ({ row }) => (
        <div className="flex items-center justify-between">
          <span>{row.original.usedCount}</span>
          <span className="text-muted-foreground">/</span>
          <span>{row.original.maxUsage}</span>
        </div>
      ),
    },
    // 🆕 ستون جدید برای maxUsagePerUser
    {
      accessorKey: "maxUsagePerUser",
      header: t("admin.coupons.maxUsagePerUser"),
      cell: ({ row }) => {
        const maxUsagePerUser = row.original.maxUsagePerUser;

        return (
          <div className="flex items-center">
            {maxUsagePerUser === -1 ? (
              <>
                <Infinity className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-blue-500">{t("common.unlimited")}</span>
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{maxUsagePerUser}</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: t("admin.coupons.expiresAt"),
      cell: ({ row }) => {
        const now = new Date();
        const endDate = new Date(row.original.endDate);
        const isExpired = endDate < now;

        return (
          <div className="flex items-center">
            <Calendar
              className={`mr-2 h-4 w-4 ${
                isExpired ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            <span className={isExpired ? "text-red-500" : ""}>
              {formatDate(row.original.endDate, isRtl ? "fa-IR" : "en-US")}
            </span>
          </div>
        );
      },
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
        const coupon = row.original;

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
                  router.push(`/dashboard/admin/coupons/edit/${coupon._id}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteCoupon(coupon)}
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
      data={coupons}
      searchKey="code"
      searchPlaceholder={t("admin.coupons.search")}
      noResultsText={t("admin.coupons.noCoupons")}
    />
  );
}
