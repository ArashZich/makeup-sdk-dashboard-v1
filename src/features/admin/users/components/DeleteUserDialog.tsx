// src/features/admin/users/components/DeleteUserDialog.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@/api/types/users.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "@/components/common/Loader";

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({
  user,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteUserDialogProps) {
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={() => !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.users.deleteUser")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.users.confirmDelete")}
            <div className="mt-2 text-sm">
              <span className="font-semibold">{user.name}</span> ({user.phone})
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? <Loader size="sm" className="mr-2" /> : null}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
