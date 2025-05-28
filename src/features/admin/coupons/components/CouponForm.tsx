// src/features/admin/coupons/components/CouponForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/api/hooks/usePlans";
import {
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/api/types/coupons.types";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader } from "@/components/common/Loader";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "luxon";
import { CalendarIcon, Plus, X, Users, Infinity } from "lucide-react";
import { toJalali } from "@/lib/date";
import logger from "@/lib/logger";

// اسکیما برای اعتبارسنجی فرم
const couponSchema = z
  .object({
    code: z.string().min(3, { message: "Code must be at least 3 characters" }),
    description: z
      .string()
      .min(5, { message: "Description must be at least 5 characters" }),
    percent: z.coerce
      .number()
      .min(1, { message: "Discount percent must be at least 1%" })
      .max(100, { message: "Discount percent cannot exceed 100%" }),
    maxAmount: z.coerce
      .number()
      .min(0, { message: "Max amount cannot be negative" }),
    maxUsage: z.coerce
      .number()
      .min(1, { message: "Max usage must be at least 1" }),
    maxUsagePerUser: z.coerce
      .number()
      .min(-1, { message: "Max usage per user cannot be less than -1" }), // 🆕 فیلد جدید
    startDate: z.date(),
    endDate: z.date(),
    forPlans: z.array(z.string()).optional(),
    forUsers: z.array(z.string()).optional(),
    active: z.boolean(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type CouponFormValues = z.infer<typeof couponSchema>;

// ✅ اصلاح interface برای پشتیبانی از هر دو حالت
interface CouponFormProps {
  coupon?: Coupon;
  isSubmitting: boolean;
  onSubmit: (data: CreateCouponRequest | UpdateCouponRequest) => Promise<void>;
}

export function CouponForm({
  coupon,
  isSubmitting,
  onSubmit,
}: CouponFormProps) {
  const { t, isRtl } = useLanguage();
  const [userIdInput, setUserIdInput] = useState("");

  // دریافت لیست پلن‌ها
  const { getAllPlans } = usePlans();
  const { data: plans, isLoading: isLoadingPlans } = getAllPlans();

  // تنظیم مقادیر پیش‌فرض برای فرم
  const defaultValues: CouponFormValues = {
    code: coupon?.code || "",
    description: coupon?.description || "",
    percent: coupon?.percent || 10,
    maxAmount: coupon?.maxAmount || 0,
    maxUsage: coupon?.maxUsage || 1,
    maxUsagePerUser: coupon?.maxUsagePerUser ?? -1, // 🆕 پیش‌فرض -1 (نامحدود)
    startDate: coupon ? new Date(coupon.startDate) : new Date(),
    endDate: coupon
      ? new Date(coupon.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز از امروز
    forPlans: coupon?.forPlans
      ? Array.isArray(coupon.forPlans)
        ? coupon.forPlans.map((plan) =>
            typeof plan === "string" ? plan : plan._id
          )
        : []
      : [],
    forUsers: coupon?.forUsers
      ? Array.isArray(coupon.forUsers)
        ? coupon.forUsers.map((user) =>
            typeof user === "string" ? user : user._id
          )
        : []
      : [],
    active: coupon?.active !== undefined ? coupon.active : true,
  };

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues,
  });

  // منطق افزودن کاربر به فهرست محدودیت‌ها
  const handleUserAdd = () => {
    if (!userIdInput.trim()) return;

    const currentUsers = form.getValues("forUsers") || [];

    // بررسی تکراری بودن
    if (currentUsers.includes(userIdInput)) {
      form.setError("forUsers", {
        type: "manual",
        message: t("admin.coupons.userIdExists"),
      });
      return;
    }

    form.setValue("forUsers", [...currentUsers, userIdInput]);
    setUserIdInput("");
    form.clearErrors("forUsers");
  };

  // منطق حذف کاربر از فهرست محدودیت‌ها
  const handleUserRemove = (userId: string) => {
    const currentUsers = form.getValues("forUsers") || [];
    form.setValue(
      "forUsers",
      currentUsers.filter((id) => id !== userId)
    );
  };

  // منطق انتخاب یا حذف پلن از فهرست محدودیت‌ها
  const handlePlanToggle = (planId: string) => {
    const currentPlans = form.getValues("forPlans") || [];

    if (currentPlans.includes(planId)) {
      form.setValue(
        "forPlans",
        currentPlans.filter((id) => id !== planId)
      );
    } else {
      form.setValue("forPlans", [...currentPlans, planId]);
    }
  };

  // ✅ اصلاح handleSubmit برای پشتیبانی از هر دو حالت
  const handleSubmit = async (values: CouponFormValues) => {
    logger.api("Coupon form submitting with data:", values);

    try {
      const baseData = {
        description: values.description,
        percent: values.percent,
        maxAmount: values.maxAmount,
        maxUsage: values.maxUsage,
        maxUsagePerUser: values.maxUsagePerUser, // 🆕 اضافه کردن فیلد جدید
        startDate: DateTime.fromJSDate(values.startDate).toISO()!,
        endDate: DateTime.fromJSDate(values.endDate).toISO()!,
        forPlans: values.forPlans,
        forUsers: values.forUsers,
        active: values.active,
      };

      if (coupon) {
        // ✅ حالت update - بدون code
        const updateData: UpdateCouponRequest = baseData;
        logger.data("Update coupon data:", updateData);
        await onSubmit(updateData);
      } else {
        // ✅ حالت create - با code
        const createData: CreateCouponRequest = {
          ...baseData,
          code: values.code,
        };
        logger.data("Create coupon data:", createData);
        await onSubmit(createData);
      }
    } catch (error) {
      logger.fail("Coupon form submission failed:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.code")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("admin.coupons.codePlaceholder")}
                        {...field}
                        className="uppercase"
                        disabled={!!coupon} // کد کوپن در حالت ویرایش غیرقابل تغییر است
                      />
                    </FormControl>
                    {coupon && (
                      <FormDescription>
                        {t("admin.coupons.codeCannotBeChanged")}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("admin.coupons.active")}</FormLabel>
                      <FormDescription>
                        {t("admin.coupons.activeDescription")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("admin.coupons.descriptionPlaceholder")}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.discountPercent")}</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          placeholder={t("admin.coupons.percentPlaceholder")}
                          {...field}
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.maxAmount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("admin.coupons.maxAmountPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("admin.coupons.maxAmountDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.maxUsage")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("admin.coupons.maxUsagePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🆕 فیلد جدید maxUsagePerUser */}
              <FormField
                control={form.control}
                name="maxUsagePerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("admin.coupons.maxUsagePerUser")}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "admin.coupons.maxUsagePerUserPlaceholder"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-1">
                              <div className="flex items-center gap-2">
                                <Infinity className="h-4 w-4 text-blue-500" />
                                <span>{t("admin.coupons.unlimitedUsage")}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="1">
                              1 {t("admin.coupons.usagePerUser")}
                            </SelectItem>
                            <SelectItem value="2">
                              2 {t("admin.coupons.usagePerUser")}
                            </SelectItem>
                            <SelectItem value="3">
                              3 {t("admin.coupons.usagePerUser")}
                            </SelectItem>
                            <SelectItem value="5">
                              5 {t("admin.coupons.usagePerUser")}
                            </SelectItem>
                            <SelectItem value="10">
                              10 {t("admin.coupons.usagePerUser")}
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* نمایش فیلد manual برای مقادیر سفارشی */}
                        {![-1, 1, 2, 3, 5, 10].includes(field.value) && (
                          <Input
                            type="number"
                            placeholder={t(
                              "admin.coupons.maxUsagePerUserPlaceholder"
                            )}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || -1)
                            }
                            min="-1"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t("admin.coupons.maxUsagePerUserDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("admin.coupons.startDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                toJalali(field.value)
                              ) : (
                                <span>{t("admin.coupons.selectDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()} // گذشته غیرفعال است
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("admin.coupons.endDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                toJalali(field.value)
                              ) : (
                                <span>{t("admin.coupons.selectDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()} // گذشته غیرفعال است
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* محدودیت‌های پلن */}
            <div className="mt-8">
              <FormField
                control={form.control}
                name="forPlans"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.planRestrictions")}</FormLabel>
                    <FormDescription>
                      {t("admin.coupons.planRestrictionsDescription")}
                    </FormDescription>
                    <div className="mt-2">
                      {isLoadingPlans ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader size="md" text="common.loading" />
                        </div>
                      ) : plans && plans.results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {plans?.results.map((plan) => {
                            const isSelected = form
                              .watch("forPlans")
                              ?.includes(plan._id);
                            return (
                              <div
                                key={plan._id}
                                className={`border rounded-md p-3 cursor-pointer ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border"
                                }`}
                                onClick={() => handlePlanToggle(plan._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{plan.name}</div>
                                  <div>
                                    {isSelected ? (
                                      <Badge variant="default">
                                        {t("common.selected")}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        {t("common.select")}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {plan.price.toLocaleString(
                                    isRtl ? "fa-IR" : "en-US",
                                    {
                                      style: "currency",
                                      currency: "IRR", // پیش‌فرض ریال ایران - می‌توانید بر اساس نیاز تغییر دهید
                                    }
                                  )}{" "}
                                  | {plan.duration} {t("admin.coupons.days")}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {t("admin.coupons.noPlansAvailable")}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* محدودیت‌های کاربر */}
            <div className="mt-8">
              <FormField
                control={form.control}
                name="forUsers"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("admin.coupons.userRestrictions")}</FormLabel>
                    <FormDescription>
                      {t("admin.coupons.userRestrictionsDescription")}
                    </FormDescription>
                    <div className="flex mt-2 mb-2">
                      <Input
                        value={userIdInput}
                        onChange={(e) => setUserIdInput(e.target.value)}
                        placeholder={t("admin.coupons.userIdPlaceholder")}
                        className="mr-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUserAdd();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleUserAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.coupons.addUser")}
                      </Button>
                    </div>
                    <FormMessage />
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        {t("admin.coupons.currentUsers")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("forUsers")?.length ? (
                          form.watch("forUsers")?.map((userId) => (
                            <div
                              key={userId}
                              className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                            >
                              {userId}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => handleUserRemove(userId)}
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {t("admin.coupons.noUsersAdded")}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader size="sm" className="mr-2" />}
            {coupon ? t("common.update") : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
