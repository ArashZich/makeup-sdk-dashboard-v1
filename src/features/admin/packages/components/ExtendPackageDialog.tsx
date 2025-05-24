// src/features/admin/packages/components/ExtendPackageDialog.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExtendPackageRequest } from "@/api/types/packages.types";

interface ExtendPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ExtendPackageRequest) => void;
  isLoading?: boolean;
  packageId?: string;
}

export function ExtendPackageDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  packageId,
}: ExtendPackageDialogProps) {
  const { t } = useLanguage();

  // اسکیمای اعتبارسنجی با پیام‌های دیکشنری
  const extendFormSchema = z.object({
    days: z
      .number()
      .min(1, t("admin.packages.extend.validation.daysMin"))
      .max(365, t("admin.packages.extend.validation.daysMax")),
  });

  type ExtendFormData = z.infer<typeof extendFormSchema>;

  const form = useForm<ExtendFormData>({
    resolver: zodResolver(extendFormSchema),
    defaultValues: {
      days: 30,
    },
  });

  const handleSubmit = async (data: ExtendFormData) => {
    await onConfirm({ days: data.days });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.packages.extend.title")}</DialogTitle>
          <DialogDescription>
            {t("admin.packages.extend.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.packages.extend.daysLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("admin.packages.extend.daysPlaceholder")}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t("admin.packages.extend.extending")
                  : t("admin.packages.extend.extendButton")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
