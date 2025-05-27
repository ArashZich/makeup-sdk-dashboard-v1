// src/features/admin/packages/components/UpdatePackageLimitsDialog.tsx
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { UpdatePackageLimitsRequest } from "@/api/types/packages.types";
import { Zap, Calendar } from "lucide-react";

interface UpdatePackageLimitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: UpdatePackageLimitsRequest) => void;
  isLoading?: boolean;
  packageId?: string;
}

export function UpdatePackageLimitsDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  packageId,
}: UpdatePackageLimitsDialogProps) {
  const { t } = useLanguage();

  // اسکیمای اعتبارسنجی
  const limitsFormSchema = z.object({
    addRequests: z
      .number()
      .min(0, t("admin.packages.limits.validation.requestsMin"))
      .max(100000, t("admin.packages.limits.validation.requestsMax"))
      .optional(),
    addDays: z
      .number()
      .min(0, t("admin.packages.limits.validation.daysMin"))
      .max(365, t("admin.packages.limits.validation.daysMax"))
      .optional(),
  });

  type LimitsFormData = z.infer<typeof limitsFormSchema>;

  const form = useForm<LimitsFormData>({
    resolver: zodResolver(limitsFormSchema),
    defaultValues: {
      addRequests: undefined,
      addDays: undefined,
    },
  });

  const handleSubmit = async (data: LimitsFormData) => {
    // حداقل یکی از فیلدها باید مقدار داشته باشه
    if (!data.addRequests && !data.addDays) {
      form.setError("addRequests", {
        type: "manual",
        message: t("admin.packages.limits.validation.atLeastOne"),
      });
      return;
    }

    // فقط فیلدهایی که مقدار دارن رو ارسال کن
    const cleanData: UpdatePackageLimitsRequest = {};
    if (data.addRequests && data.addRequests > 0) {
      cleanData.addRequests = data.addRequests;
    }
    if (data.addDays && data.addDays > 0) {
      cleanData.addDays = data.addDays;
    }

    await onConfirm(cleanData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("admin.packages.limits.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.packages.limits.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* افزودن درخواست */}
            <FormField
              control={form.control}
              name="addRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {t("admin.packages.limits.addRequestsLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t(
                        "admin.packages.limits.requestsPlaceholder"
                      )}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("admin.packages.limits.requestsDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* افزودن روز */}
            <FormField
              control={form.control}
              name="addDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("admin.packages.limits.addDaysLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("admin.packages.limits.daysPlaceholder")}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("admin.packages.limits.daysDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* راهنما */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 {t("admin.packages.limits.tipTitle")}
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• {t("admin.packages.limits.tip1")}</li>
                <li>• {t("admin.packages.limits.tip2")}</li>
                <li>• {t("admin.packages.limits.tip3")}</li>
              </ul>
            </div>

            {/* دکمه‌ها */}
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
                  ? t("admin.packages.limits.updating")
                  : t("admin.packages.limits.updateButton")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
