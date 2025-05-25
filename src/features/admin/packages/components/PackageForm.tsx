// src/features/admin/packages/components/PackageForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/api/hooks/usePlans";
import { useAdminUsers } from "@/api/hooks/useUsers";
import {
  CreatePackageRequest,
  PurchasePlatform,
} from "@/api/types/packages.types";
import { logger } from "@/lib/logger";

interface PackageFormProps {
  onSubmit: (data: CreatePackageRequest) => Promise<void>;
  isLoading?: boolean;
}

export function PackageForm({ onSubmit, isLoading = false }: PackageFormProps) {
  const { t } = useLanguage();

  // اسکیمای اعتبارسنجی با پیام‌های دیکشنری
  const packageFormSchema = z.object({
    userId: z.string().min(1, t("admin.packages.form.validation.userRequired")),
    planId: z.string().min(1, t("admin.packages.form.validation.planRequired")),
    duration: z
      .number()
      .min(1, t("admin.packages.form.validation.durationMin"))
      .optional(),
    purchasePlatform: z.enum(["normal", "divar", "torob", "basalam"]),
  });

  type PackageFormData = z.infer<typeof packageFormSchema>;

  // دریافت لیست کاربران
  const { getUsers } = useAdminUsers();
  const { data: usersData } = getUsers();

  // دریافت لیست پلن‌ها
  const { getAllPlans } = usePlans();
  const { data: plansData } = getAllPlans();

  // تنظیم فرم
  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      userId: "",
      planId: "",
      duration: undefined,
      purchasePlatform: "normal",
    },
  });

  // ارسال فرم
  const handleSubmit = async (data: PackageFormData) => {
    try {
      const packageData: CreatePackageRequest = {
        userId: data.userId,
        planId: data.planId,
        purchasePlatform: data.purchasePlatform,
        ...(data.duration && { duration: data.duration }),
      };

      await onSubmit(packageData);
      form.reset();
    } catch (error) {
      logger.error("Error creating package:", error);
    }
  };

  // کلیدهای پلتفرم برای دیکشنری
  const platformKeys: PurchasePlatform[] = [
    "normal",
    "divar",
    "torob",
    "basalam",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.packages.form.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* انتخاب کاربر */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.packages.form.userLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.packages.form.selectUser")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersData?.results.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* انتخاب پلن */}
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.packages.form.planLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.packages.form.selectPlan")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plansData?.results.map((plan) => (
                        <SelectItem key={plan._id} value={plan._id}>
                          {plan.name} - {plan.duration} {t("common.days")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* پلتفرم خرید */}
            <FormField
              control={form.control}
              name="purchasePlatform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.packages.form.platformLabel")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.packages.form.selectPlatform")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platformKeys.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {t(`admin.packages.platformLabels.${platform}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("admin.packages.form.platformDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* مدت زمان دلخواه */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.packages.form.durationLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("admin.packages.form.durationPlaceholder")}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("admin.packages.form.durationDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* دکمه ارسال */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? t("admin.packages.form.creating")
                : t("admin.packages.form.createButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
