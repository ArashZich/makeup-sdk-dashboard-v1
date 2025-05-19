// src/features/admin/components/users/DeleteUserDialog.tsx
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
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";

interface DeleteUserDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteUserDialog({
  isOpen,
  isDeleting,
  user,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) {
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.users.deleteUser")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.users.deleteUserConfirmation", { name: user.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader size="sm" className="mr-2" />
                {t("common.deleting")}
              </>
            ) : (
              t("common.delete")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
