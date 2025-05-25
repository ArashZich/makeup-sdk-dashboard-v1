// src/features/admin/users/views/EditUserView.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { UserForm } from "../components/UserForm";
import { Loader } from "@/components/common/Loader";
import { BackButtonIcon } from "@/components/common/BackButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";

export function EditUserView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  // اطمینان از اینکه userId یک رشته است
  const userId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  // اگر userId خالی باشد، باید به صفحه لیست کاربران برگردیم
  if (!userId) {
    router.push("/dashboard/admin/users");
    return null;
  }

  const { getUser, updateUser, isUpdatingUser } = useAdminUsers();

  const { data: user, isLoading, error } = getUser(userId); // حالا userId قطعاً یک رشته است

  const handleSubmit = async (data: any) => {
    try {
      await updateUser({ userId, data }); // حالا userId قطعاً یک رشته است
      showToast.success(t("admin.users.updateSuccess"));
      router.push(`/dashboard/admin/users/${userId}`);
    } catch (error) {
      logger.error("Error updating user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("common.error.title")}</AlertTitle>
        <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>

        <BackButtonIcon href="/dashboard/admin/users" />
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BackButtonIcon href={`/dashboard/admin/users/${userId}`} />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.users.editUser")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.editUserDescription")}
          </p>
        </div>
      </div>

      <UserForm
        user={user}
        isSubmitting={isUpdatingUser}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
