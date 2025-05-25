// src/features/admin/users/views/UsersView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { User, UserFilters } from "@/api/types/users.types";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { UserTable } from "../components/UserTable";
import { UserFilters as UserFiltersComponent } from "../components/UserFilters";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, Users, AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";

export function UsersView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilters>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { getUsers, deleteUser, isDeletingUser } = useAdminUsers();

  const { data, isLoading, error, refetch } = getUsers(filters);

  // رفرش داده‌ها هنگام تغییر فیلترها
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete._id);
      setUserToDelete(null);
      refetch();
    } catch (error) {
      logger.error("Error deleting user:", error);
    }
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Users className="mr-2 h-6 w-6" />
            {t("admin.users.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.description")}
          </p>
        </div>

        <Button onClick={() => router.push("/dashboard/admin/users/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("admin.users.addUser")}
        </Button>
      </div>

      {/* فیلترها */}
      <UserFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* جدول کاربران */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader size="lg" text="common.loading" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error.title")}</AlertTitle>
          <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>
        </Alert>
      ) : data && data.results.length > 0 ? (
        <UserTable users={data.results} onDeleteUser={handleDeleteClick} />
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {t("admin.users.noUsers")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("admin.users.noUsersDescription")}
          </p>
          <Button
            onClick={() => router.push("/dashboard/admin/users/create")}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("admin.users.addUser")}
          </Button>
        </div>
      )}

      {/* دیالوگ حذف کاربر */}
      <DeleteUserDialog
        user={userToDelete}
        isOpen={!!userToDelete}
        isDeleting={isDeletingUser}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
