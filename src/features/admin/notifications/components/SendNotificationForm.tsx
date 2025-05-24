// src/features/admin/notifications/components/SendNotificationForm.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/api/hooks/usePlans";
import {
  SendNotificationRequest,
  NotificationType,
} from "@/api/types/notifications.types";

interface SendNotificationFormProps {
  onSubmit: (data: SendNotificationRequest) => Promise<void>;
  isLoading?: boolean;
}

type NotificationTarget = "all" | "plan" | "users";

export function SendNotificationForm({
  onSubmit,
  isLoading = false,
}: SendNotificationFormProps) {
  const { t } = useLanguage();
  const [target, setTarget] = useState<NotificationTarget>("all");

  // دریافت لیست پلن‌ها
  const { getAllPlans } = usePlans();
  const { data: plansData } = getAllPlans();

  // اسکیمای اعتبارسنجی - ساده‌تر
  const createNotificationFormSchema = () => {
    return z.object({
      title: z
        .string()
        .min(1, t("admin.notifications.form.validation.titleRequired")),
      message: z
        .string()
        .min(1, t("admin.notifications.form.validation.messageRequired")),
      type: z.enum(["expiry", "payment", "system", "other"] as const, {
        required_error: t("admin.notifications.form.validation.typeRequired"),
      }),
      target: z.enum(["all", "plan", "users"] as const, {
        required_error: t("admin.notifications.form.validation.targetRequired"),
      }),
      planId: z.string().optional(),
      userIds: z.string().optional(),
      sendSms: z.boolean(),
    });
  };

  type NotificationFormData = z.infer<
    ReturnType<typeof createNotificationFormSchema>
  >;

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(createNotificationFormSchema()),
    defaultValues: {
      title: "",
      message: "",
      type: "system",
      target: "all",
      planId: "",
      userIds: "",
      sendSms: false,
    },
  });

  const handleSubmit = async (data: NotificationFormData) => {
    try {
      // اعتبارسنجی شرطی
      if (data.target === "plan" && !data.planId) {
        form.setError("planId", {
          message: t("admin.notifications.form.validation.planRequired"),
        });
        return;
      }

      if (data.target === "users" && !data.userIds) {
        form.setError("userIds", {
          message: t("admin.notifications.form.validation.usersRequired"),
        });
        return;
      }

      const requestData: SendNotificationRequest = {
        title: data.title,
        message: data.message,
        type: data.type,
        sendSms: data.sendSms,
      };

      // اضافه کردن فیلدهای شرطی بر اساس target
      if (data.target === "plan" && data.planId) {
        requestData.planId = data.planId;
      } else if (data.target === "users" && data.userIds) {
        // تبدیل رشته شناسه‌ها به آرایه
        const userIdArray = data.userIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        if (userIdArray.length > 0) {
          requestData.userId = userIdArray[0]; // API فقط یک userId می‌پذیرد
        }
      }

      await onSubmit(requestData);
      form.reset();
      setTarget("all");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const notificationTypes: NotificationType[] = [
    "expiry",
    "payment",
    "system",
    "other",
  ];
  const targetOptions: NotificationTarget[] = ["all", "plan", "users"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.notifications.form.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* عنوان اطلاعیه */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.notifications.form.titleLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "admin.notifications.form.titlePlaceholder"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* متن اطلاعیه */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.notifications.form.messageLabel")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "admin.notifications.form.messagePlaceholder"
                      )}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نوع اطلاعیه */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.notifications.form.typeLabel")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "admin.notifications.form.typeSelectPlaceholder"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`admin.notifications.types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* مقصد ارسال */}
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("admin.notifications.form.targetLabel")}
                  </FormLabel>
                  <Select
                    onValueChange={(value: NotificationTarget) => {
                      field.onChange(value);
                      setTarget(value);
                      // پاک کردن خطاهای قبلی
                      form.clearErrors("planId");
                      form.clearErrors("userIds");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "admin.notifications.form.targetSelectPlaceholder"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetOptions.map((targetOption) => (
                        <SelectItem key={targetOption} value={targetOption}>
                          {t(`admin.notifications.targets.${targetOption}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* انتخاب پلن (فقط در صورت انتخاب target=plan) */}
            {target === "plan" && (
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.notifications.form.planLabel")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "admin.notifications.form.planSelectPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plansData?.map((plan) => (
                          <SelectItem key={plan._id} value={plan._id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* شناسه کاربران (فقط در صورت انتخاب target=users) */}
            {target === "users" && (
              <FormField
                control={form.control}
                name="userIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.notifications.form.usersLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "admin.notifications.form.usersPlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      شناسه کاربران را با کاما جدا کنید
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ارسال پیامک */}
            <FormField
              control={form.control}
              name="sendSms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t("admin.notifications.form.sendSmsLabel")}
                    </FormLabel>
                    <FormDescription>
                      {t("admin.notifications.form.sendSmsDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* دکمه ارسال */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? t("admin.notifications.form.sending")
                : t("admin.notifications.form.sendButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
