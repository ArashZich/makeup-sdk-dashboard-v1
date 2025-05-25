// src/features/admin/users/components/UserForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/api/types/users.types";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/common/Loader";

// اسکیما برای اعتبارسنجی فرم
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .optional()
    .or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  role: z.enum(["user", "admin"]),
  userType: z.enum(["real", "legal"]).optional(),
  nationalId: z.string().optional().or(z.literal("")),
  allowedDomains: z.array(z.string()).optional(),
  notificationSettings: z
    .object({
      email: z.boolean(),
      sms: z.boolean(),
    })
    .optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  isSubmitting: boolean;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
}

export function UserForm({ user, isSubmitting, onSubmit }: UserFormProps) {
  const { t } = useLanguage();
  const [domainInput, setDomainInput] = useState("");

  // تنظیم مقادیر پیش‌فرض برای فرم
  const defaultValues: UserFormValues = {
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    company: user?.company || "",
    role: user?.role || "user",
    userType: user?.userType || "real",
    nationalId: user?.nationalId || "",
    allowedDomains: user?.allowedDomains || [],
    notificationSettings: user?.notificationSettings || {
      email: true,
      sms: true,
    },
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  const handleDomainAdd = () => {
    if (!domainInput.trim()) return;

    // بررسی اعتبار دامنه ساده
    const domainRegex =
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domainInput)) {
      form.setError("allowedDomains", {
        type: "manual",
        message: t("profile.invalidDomain"),
      });
      return;
    }

    const currentDomains = form.getValues("allowedDomains") || [];

    // بررسی تکراری بودن دامنه
    if (currentDomains.includes(domainInput)) {
      form.setError("allowedDomains", {
        type: "manual",
        message: t("profile.domainExists"),
      });
      return;
    }

    form.setValue("allowedDomains", [...currentDomains, domainInput]);
    setDomainInput("");
    form.clearErrors("allowedDomains");
  };

  const handleDomainRemove = (domain: string) => {
    const currentDomains = form.getValues("allowedDomains") || [];
    form.setValue(
      "allowedDomains",
      currentDomains.filter((d) => d !== domain)
    );
  };

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* اطلاعات اصلی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.namePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.phone")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.phonePlaceholder")}
                          {...field}
                          disabled={!!user} // اگر در حالت ویرایش هستیم، شماره تلفن غیرفعال باشد
                        />
                      </FormControl>
                      {user && (
                        <FormDescription>
                          {t("profile.phoneCannotBeChanged")}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.emailPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.role")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "admin.users.form.rolePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">
                            {t("profile.roles.user")}
                          </SelectItem>
                          <SelectItem value="admin">
                            {t("profile.roles.admin")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.company")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("admin.users.form.companyPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.userType")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "admin.users.form.userTypePlaceholder"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="real">
                            {t("profile.userTypes.real")}
                          </SelectItem>
                          <SelectItem value="legal">
                            {t("profile.userTypes.legal")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.users.form.nationalId")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "admin.users.form.nationalIdPlaceholder"
                          )}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* تنظیمات اطلاع‌رسانی */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">
                  {t("profile.notificationSettings")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="notificationSettings.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("profile.emailNotifications")}
                          </FormLabel>
                          <FormDescription>
                            {t("profile.emailNotificationsDescription")}
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
                  <FormField
                    control={form.control}
                    name="notificationSettings.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t("profile.smsNotifications")}
                          </FormLabel>
                          <FormDescription>
                            {t("profile.smsNotificationsDescription")}
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
                </div>
              </div>

              {/* دامنه‌های مجاز */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">
                  {t("profile.allowedDomains")}
                </h3>
                <FormItem>
                  <FormLabel>{t("profile.domainRestriction")}</FormLabel>
                  <FormDescription>
                    {t("profile.domainRestrictionDescription")}
                  </FormDescription>
                  <div className="flex mt-2 mb-2">
                    <Input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder={t("profile.domainFormat")}
                      className="mr-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleDomainAdd();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleDomainAdd}>
                      {t("profile.addDomain")}
                    </Button>
                  </div>
                  <FormMessage />
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      {t("profile.yourDomains")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {form.watch("allowedDomains")?.length ? (
                        form.watch("allowedDomains")?.map((domain) => (
                          <div
                            key={domain}
                            className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                          >
                            {domain}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-2"
                              onClick={() => handleDomainRemove(domain)}
                            >
                              &times;
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("profile.noDomainsAdded")}
                        </p>
                      )}
                    </div>
                  </div>
                </FormItem>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader size="sm" className="mr-2" />}
            {user ? t("common.update") : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
