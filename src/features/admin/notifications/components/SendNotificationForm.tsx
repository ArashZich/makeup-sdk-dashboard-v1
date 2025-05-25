// src/features/admin/notifications/components/SendNotificationForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAdminNotifications } from "@/api/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserPlanSelector } from "./UserPlanSelector";

// Schema validation
const formSchema = z.object({
  title: z.string().min(1, "titleRequired"),
  message: z.string().min(1, "messageRequired"),
  type: z.enum(["expiry", "payment", "system", "other"], {
    required_error: "typeRequired",
  }),
  target: z.enum(["all", "plan", "users"], {
    required_error: "targetRequired",
  }),
  planId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  sendSms: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export function SendNotificationForm() {
  const { t } = useLanguage();
  const { sendNotification, isSendingNotification } = useAdminNotifications();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      type: undefined,
      target: undefined,
      planId: "",
      userIds: [],
      sendSms: false,
    },
  });

  const watchTarget = form.watch("target");

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        title: data.title,
        message: data.message,
        type: data.type,
        sendSms: data.sendSms,
        ...(data.target === "plan" && { planId: data.planId }),
        ...(data.target === "users" && {
          userId: data.userIds?.join(","), // تبدیل آرایه به string با کاما
        }),
      };

      await sendNotification(payload);
      form.reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.notifications.form.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
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

            {/* Message */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
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
                        <SelectItem value="expiry">
                          {t("admin.notifications.types.expiry")}
                        </SelectItem>
                        <SelectItem value="payment">
                          {t("admin.notifications.types.payment")}
                        </SelectItem>
                        <SelectItem value="system">
                          {t("admin.notifications.types.system")}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("admin.notifications.types.other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target */}
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.notifications.form.targetLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                        <SelectItem value="all">
                          {t("admin.notifications.targets.all")}
                        </SelectItem>
                        <SelectItem value="plan">
                          {t("admin.notifications.targets.plan")}
                        </SelectItem>
                        <SelectItem value="users">
                          {t("admin.notifications.targets.users")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional fields based on target */}
            {watchTarget === "plan" && (
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.notifications.form.planLabel")}
                    </FormLabel>
                    <FormControl>
                      <UserPlanSelector
                        mode="plan"
                        selectedPlan={field.value}
                        onPlanChange={field.onChange}
                        placeholder={t(
                          "admin.notifications.form.planSelectPlaceholder"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchTarget === "users" && (
              <FormField
                control={form.control}
                name="userIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("admin.notifications.form.usersLabel")}
                    </FormLabel>
                    <FormControl>
                      <UserPlanSelector
                        mode="users"
                        selectedUsers={field.value || []}
                        onUsersChange={field.onChange}
                        placeholder={t(
                          "admin.notifications.form.usersPlaceholder"
                        )}
                        maxUsers={20}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("admin.notifications.form.usersDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            {/* SMS Option */}
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSendingNotification}
            >
              {isSendingNotification
                ? t("admin.notifications.form.sending")
                : t("admin.notifications.form.sendButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
