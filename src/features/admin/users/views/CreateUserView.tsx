// src/features/admin/users/views/CreateUserView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { UserForm } from "../components/UserForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { showToast } from "@/lib/toast";

export function CreateUserView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { createUser, isCreatingUser } = useAdminUsers();

  const handleSubmit = async (data: any) => {
    try {
      await createUser(data);
      showToast.success(t("admin.users.createSuccess"));
      router.push("/dashboard/admin/users");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/admin/users")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.users.addUser")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.users.addUserDescription")}
          </p>
        </div>
      </div>

      <UserForm isSubmitting={isCreatingUser} onSubmit={handleSubmit} />
    </div>
  );
}
