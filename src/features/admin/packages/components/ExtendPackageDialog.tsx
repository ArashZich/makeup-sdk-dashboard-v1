// src/features/admin/packages/components/ExtendPackageDialog.tsx
"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ExtendPackageRequest,
  UpdatePackageLimitsRequest,
} from "@/api/types/packages.types";
import { Calendar, Zap } from "lucide-react";

interface ExtendPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtendDays: (data: ExtendPackageRequest) => void;
  onUpdateLimits: (data: UpdatePackageLimitsRequest) => void;
  isLoadingExtend?: boolean;
  isLoadingUpdate?: boolean;
  packageId?: string;
}

export function ExtendPackageDialog({
  open,
  onOpenChange,
  onExtendDays,
  onUpdateLimits,
  isLoadingExtend = false,
  isLoadingUpdate = false,
  packageId,
}: ExtendPackageDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("days");

  // اسکیمای اعتبارسنجی برای روزها
  const extendDaysSchema = z.object({
    days: z
      .number()
      .min(1, t("admin.packages.extend.validation.daysMin"))
      .max(365, t("admin.packages.extend.validation.daysMax")),
  });

  // اسکیمای اعتبارسنجی برای درخواست‌ها
  const updateLimitsSchema = z.object({
    addRequests: z
      .number()
      .min(1, t("admin.packages.updateLimits.validation.requestsMin"))
      .max(1000000, t("admin.packages.updateLimits.validation.requestsMax"))
      .optional(),
    addDays: z
      .number()
      .min(1, t("admin.packages.updateLimits.validation.daysMin"))
      .max(365, t("admin.packages.updateLimits.validation.daysMax"))
      .optional(),
  });

  type ExtendDaysData = z.infer<typeof extendDaysSchema>;
  type UpdateLimitsData = z.infer<typeof updateLimitsSchema>;

  const extendForm = useForm<ExtendDaysData>({
    resolver: zodResolver(extendDaysSchema),
    defaultValues: {
      days: 30,
    },
  });

  const updateForm = useForm<UpdateLimitsData>({
    resolver: zodResolver(updateLimitsSchema),
    defaultValues: {
      addRequests: undefined,
      addDays: undefined,
    },
  });

  const handleExtendDays = async (data: ExtendDaysData) => {
    await onExtendDays({ days: data.days });
    extendForm.reset();
    onOpenChange(false);
  };

  const handleUpdateLimits = async (data: UpdateLimitsData) => {
    await onUpdateLimits(data);
    updateForm.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.packages.extendPackage")}</DialogTitle>
          <DialogDescription>
            {t("admin.packages.extendPackageDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="days" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("admin.packages.extendDays")}
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t("admin.packages.updateLimits.title")}
            </TabsTrigger>
          </TabsList>

          {/* تب تمدید روزها */}
          <TabsContent value="days">
            <Form {...extendForm}>
              <form
                onSubmit={extendForm.handleSubmit(handleExtendDays)}
                className="space-y-4"
              >
                <FormField
                  control={extendForm.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.packages.extend.daysLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t(
                            "admin.packages.extend.daysPlaceholder"
                          )}
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
                    disabled={isLoadingExtend}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoadingExtend}>
                    {isLoadingExtend
                      ? t("admin.packages.extend.extending")
                      : t("admin.packages.extend.extendButton")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* تب آپدیت محدودیت‌ها */}
          <TabsContent value="limits">
            <Form {...updateForm}>
              <form
                onSubmit={updateForm.handleSubmit(handleUpdateLimits)}
                className="space-y-4"
              >
                <FormField
                  control={updateForm.control}
                  name="addRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.packages.updateLimits.requestsLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t(
                            "admin.packages.updateLimits.requestsPlaceholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="addDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("admin.packages.updateLimits.daysLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t(
                            "admin.packages.updateLimits.daysPlaceholder"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
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
                    disabled={isLoadingUpdate}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoadingUpdate}>
                    {isLoadingUpdate
                      ? t("admin.packages.updateLimits.updating")
                      : t("admin.packages.updateLimits.updateButton")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
