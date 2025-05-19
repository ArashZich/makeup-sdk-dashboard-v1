// src/features/admin/views/users/UsersListView.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserTable } from "../../components/users/UserTable";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, AlertTriangle } from "lucide-react";

export function UsersListView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { getUsers, deleteUser } = useAdminUsers();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});

  // Prepare filters for API call
  const apiFilters = {
    ...filters,
    page: pageIndex + 1, // API uses 1-based indexing
    limit: pageSize,
  };

  const { data: usersData, isLoading, error, refetch } = getUsers(apiFilters);

  const users = usersData?.results || [];
  const totalCount = usersData?.totalResults || 0;

  const handlePaginationChange = (
    newPageIndex: number,
    newPageSize: number
  ) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    setPageIndex(0); // Reset to first page when applying new filters
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.users.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.description")}
          </p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/admin/users/create")}
          className="self-start"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("admin.users.createUser")}
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("admin.users.error.title")}</AlertTitle>
          <AlertDescription>
            {t("admin.users.error.fetchFailed")}
          </AlertDescription>
        </Alert>
      ) : (
        <UserTable
          users={users}
          isLoading={isLoading}
          totalCount={totalCount}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPaginationChange={handlePaginationChange}
          onFilter={handleFilter}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}
