// src/features/admin/users/components/UserTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@/api/types/users.types";
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
import { formatDate } from "@/lib";
import {
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface UserTableProps {
  users: User[];
  onDeleteUser: (user: User) => void;
}

export function UserTable({ users, onDeleteUser }: UserTableProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: t("common.phone"),
    },
    {
      accessorKey: "email",
      header: t("common.email"),
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "role",
      header: t("admin.users.role"),
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "default" : "outline"}>
          {t(`profile.roles.${row.original.role}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "verified",
      header: t("common.status"),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.verified ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-green-500">
                {t("admin.users.verified")}
              </span>
            </>
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">
                {t("admin.users.notVerified")}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("common.date"),
      cell: ({ row }) =>
        formatDate(row.original.createdAt, isRtl ? "fa-IR" : "en-US"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

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
                  router.push(`/dashboard/admin/users/${user._id}`)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/admin/users/edit/${user._id}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteUser(user)}
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
      data={users}
      searchKey="name"
      searchPlaceholder={t("admin.users.search")}
      noResultsText={t("admin.users.noUsers")}
    />
  );
}
