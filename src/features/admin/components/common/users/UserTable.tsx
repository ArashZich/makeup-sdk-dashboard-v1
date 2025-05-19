// src/features/admin/components/users/UserTable.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "../common/AdminDataTable";
import { User } from "@/api/types/users.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { UserFilters } from "./UserFilters";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onFilter: (filters: any) => void;
  onDelete: (userId: string) => Promise<void>;
}

export function UserTable({
  users,
  isLoading,
  totalCount,
  pageSize,
  pageIndex,
  onPaginationChange,
  onFilter,
  onDelete,
}: UserTableProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(userToDelete._id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: t("common.phone"),
      },
      {
        accessorKey: "email",
        header: t("common.email"),
        cell: ({ row }) => <div>{row.original.email || "-"}</div>,
      },
      {
        accessorKey: "role",
        header: t("profile.role"),
        cell: ({ row }) => (
          <Badge
            variant={row.original.role === "admin" ? "destructive" : "default"}
          >
            {t(`profile.roles.${row.original.role}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "verified",
        header: t("profile.verified"),
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.verified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("profile.createdAt"),
        cell: ({ row }) =>
          formatDate(row.original.createdAt, isRtl ? "fa-IR" : "en-US"),
      },
      {
        id: "actions",
        header: t("common.actions"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(`/dashboard/admin/users/${row.original._id}`)
              }
              title={t("common.view")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push(`/dashboard/admin/users/${row.original._id}/edit`)
              }
              title={t("common.edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setUserToDelete(row.original);
                setIsDeleteDialogOpen(true);
              }}
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [t, isRtl, router, onDelete]
  );

  return (
    <div className="space-y-4">
      <UserFilters onFilter={onFilter} />

      <AdminDataTable
        columns={columns}
        data={users}
        searchColumn="name"
        searchPlaceholder={t("common.searchUsers")}
        isLoading={isLoading}
        pagination={true}
        manualPagination={true}
        pageCount={Math.ceil(totalCount / pageSize)}
        onPaginationChange={onPaginationChange}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        user={userToDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
