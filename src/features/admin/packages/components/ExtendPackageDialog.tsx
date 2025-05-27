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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ExtendPackageRequest,
  UpdatePackageLimitsRequest,
} from "@/api/types/packages.types";
import { Calendar, Zap, AlertCircle } from "lucide-react";

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
    days: z.coerce.number().min(1, "حداقل 1 روز").max(365, "حداکثر 365 روز"),
  });

  // اسکیمای اعتبارسنجی برای درخواست‌ها - اصلاح شده
  const updateLimitsSchema = z.object({
    addRequests: z.coerce
      .number()
      .min(0, "تعداد درخواست نمی‌تواند منفی باشد")
      .max(1000000, "حداکثر 1,000,000 درخواست")
      .optional(),
    addDays: z.coerce
      .number()
      .min(0, "تعداد روز نمی‌تواند منفی باشد")
      .max(365, "حداکثر 365 روز")
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
      addRequests: 0,
      addDays: 0,
    },
  });

  const handleExtendDays = async (data: ExtendDaysData) => {
    await onExtendDays({ days: data.days });
    extendForm.reset();
    onOpenChange(false);
  };

  const handleUpdateLimits = async (data: UpdateLimitsData) => {
    // فقط فیلدهایی که مقدار مثبت دارن رو بفرست
    const cleanData: UpdatePackageLimitsRequest = {};

    if (data.addRequests && data.addRequests > 0) {
      cleanData.addRequests = data.addRequests;
    }

    if (data.addDays && data.addDays > 0) {
      cleanData.addDays = data.addDays;
    }

    // اگه هیچ فیلدی پر نشده، خطا نشون بده
    if (!cleanData.addRequests && !cleanData.addDays) {
      updateForm.setError("addRequests", {
        type: "manual",
        message: "حداقل یکی از فیلدها باید بیشتر از صفر باشد",
      });
      return;
    }

    await onUpdateLimits(cleanData);
    updateForm.reset();
    onOpenChange(false);
  };

  // reset کردن فرم‌ها وقتی دیالوگ بسته میشه
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      extendForm.reset();
      updateForm.reset();
      setActiveTab("days");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تمدید و بروزرسانی بسته</DialogTitle>
          <DialogDescription>
            می‌توانید بسته را تمدید کنید یا محدودیت‌های آن را افزایش دهید
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="days" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              تمدید روزها
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              افزایش محدودیت‌ها
            </TabsTrigger>
          </TabsList>

          {/* تب تمدید روزها */}
          <TabsContent value="days" className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                با این گزینه فقط تاریخ انقضای بسته تمدید می‌شود و محدودیت
                درخواست‌ها تغییر نمی‌کند.
              </AlertDescription>
            </Alert>

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
                      <FormLabel>تعداد روز برای تمدید</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="مثال: 30"
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
                        تعداد روزهایی که به مدت بسته اضافه می‌شود (1 تا 365 روز)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    disabled={isLoadingExtend}
                  >
                    انصراف
                  </Button>
                  <Button type="submit" disabled={isLoadingExtend}>
                    {isLoadingExtend ? "در حال تمدید..." : "تمدید بسته"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* تب آپدیت محدودیت‌ها */}
          <TabsContent value="limits" className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                با این گزینه می‌توانید به تعداد درخواست‌ها یا روزها اضافه کنید.
                حداقل یکی از فیلدها باید بیشتر از صفر باشد.
              </AlertDescription>
            </Alert>

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
                      <FormLabel>افزایش تعداد درخواست</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="مثال: 1000"
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
                        تعداد درخواستی که به محدودیت فعلی اضافه می‌شود
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="addDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>افزایش تعداد روز</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="مثال: 30"
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
                        تعداد روزی که به مدت بسته اضافه می‌شود
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    💡 نکته مهم
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• حداقل یکی از فیلدها باید بیشتر از صفر باشد</li>
                    <li>• می‌توانید هر دو فیلد را همزمان پر کنید</li>
                    <li>• تغییرات بلافاصله اعمال خواهد شد</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    disabled={isLoadingUpdate}
                  >
                    انصراف
                  </Button>
                  <Button type="submit" disabled={isLoadingUpdate}>
                    {isLoadingUpdate
                      ? "در حال بروزرسانی..."
                      : "بروزرسانی محدودیت‌ها"}
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
