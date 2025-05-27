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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { UpdatePackageLimitsRequest } from "@/api/types/packages.types";
import { Zap, Calendar, AlertCircle } from "lucide-react";

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

  // اسکیمای اعتبارسنجی با پیام‌های دیکشنری
  const limitsFormSchema = z.object({
    addRequests: z.coerce
      .number()
      .min(0, t("admin.packages.limits.validation.requestsMin"))
      .max(1000000, t("admin.packages.limits.validation.requestsMax"))
      .optional(),
    addDays: z.coerce
      .number()
      .min(0, t("admin.packages.limits.validation.daysMin"))
      .max(365, t("admin.packages.limits.validation.daysMax"))
      .optional(),
  });

  type LimitsFormData = z.infer<typeof limitsFormSchema>;

  const form = useForm<LimitsFormData>({
    resolver: zodResolver(limitsFormSchema),
    defaultValues: {
      addRequests: 0,
      addDays: 0,
    },
  });

  const handleSubmit = async (data: LimitsFormData) => {
    // فقط فیلدهایی که مقدار بیشتر از صفر دارن رو ارسال کن
    const cleanData: UpdatePackageLimitsRequest = {};

    if (data.addRequests && data.addRequests > 0) {
      cleanData.addRequests = data.addRequests;
    }

    if (data.addDays && data.addDays > 0) {
      cleanData.addDays = data.addDays;
    }

    // اگه هیچ فیلدی پر نشده، خطا نشون بده
    if (!cleanData.addRequests && !cleanData.addDays) {
      form.setError("addRequests", {
        type: "manual",
        message: t("admin.packages.limits.validation.atLeastOne"),
      });
      return;
    }

    await onConfirm(cleanData);
    form.reset();
    onOpenChange(false);
  };

  // reset کردن فرم وقتی دیالوگ بسته میشه
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
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

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("admin.packages.limits.alertMessage")}
          </AlertDescription>
        </Alert>

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
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : 0);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
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
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : 0);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
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
                <li>• {t("admin.packages.limits.tip4")}</li>
              </ul>
            </div>

            {/* دکمه‌ها */}
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
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
