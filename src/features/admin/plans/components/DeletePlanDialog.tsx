// src/features/admin/plans/components/DeletePlanDialog.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Plan } from "@/api/types/plans.types";
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

interface DeletePlanDialogProps {
  plan: Plan | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePlanDialog({
  plan,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeletePlanDialogProps) {
  const { t } = useLanguage();

  if (!plan) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={() => !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("plans.deletePlan")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("plans.deletePlanConfirmation", { name: plan.name })}
            <div className="mt-2 text-sm">{t("plans.deleteWarning")}</div>
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
