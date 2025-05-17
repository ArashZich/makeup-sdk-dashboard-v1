// src/features/profile/components/PersonalInfoCard.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@/api/types/users.types";
import { UpdateProfileRequest } from "@/api/types/users.types";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/Loader";
import { formatDate } from "@/lib";
import {
  CheckCircleIcon,
  PenIcon,
  SaveIcon,
  Calendar,
  XIcon,
} from "lucide-react";
import { showToast } from "@/lib/toast";

// Schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .optional()
    .or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  userType: z.enum(["real", "legal"]).optional(),
  nationalId: z.string().optional().or(z.literal("")),
  notificationSettings: z
    .object({
      email: z.boolean(),
      sms: z.boolean(),
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PersonalInfoCardProps {
  profile: User;
  isUpdatingProfile: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export function PersonalInfoCard({
  profile,
  isUpdatingProfile,
  onUpdateProfile,
}: PersonalInfoCardProps) {
  const { t, isRtl } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email || "",
      company: profile.company || "",
      userType: profile.userType,
      nationalId: profile.nationalId || "",
      notificationSettings: profile.notificationSettings || {
        email: true,
        sms: true,
      },
    },
  });

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      profileForm.reset({
        name: profile.name,
        email: profile.email || "",
        company: profile.company || "",
        userType: profile.userType,
        nationalId: profile.nationalId || "",
        notificationSettings: profile.notificationSettings || {
          email: true,
          sms: true,
        },
      });
    }
  };

  // Handle profile update
  const handleProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const updateData: UpdateProfileRequest = {
        ...values,
      };

      await onUpdateProfile(updateData);
      showToast.success(t("profile.updateSuccess"));
      setIsEditMode(false);
    } catch (error) {
      showToast.error(t("profile.updateError"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
          <CardDescription>
            {t("profile.personalInfoDescription")}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditMode}
          className="flex items-center gap-1"
        >
          {isEditMode ? (
            <>
              <XIcon className="h-4 w-4" />
              {t("common.cancel")}
            </>
          ) : (
            <>
              <PenIcon className="h-4 w-4" />
              {t("common.edit")}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditMode ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.name")}
                </div>
                <div className="font-medium">{profile.name}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.phone")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{profile.phone}</span>
                  {profile.verified && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      {t("profile.verified")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.email")}
                </div>
                <div className="font-medium">
                  {profile.email || t("profile.notProvided")}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.company")}
                </div>
                <div className="font-medium">
                  {profile.company || t("profile.notProvided")}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.userType")}
                </div>
                <div className="font-medium">
                  {profile.userType
                    ? t(`profile.userTypes.${profile.userType}`)
                    : t("profile.notProvided")}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">
                  {t("profile.nationalId")}
                </div>
                <div className="font-medium">
                  {profile.nationalId || t("profile.notProvided")}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                {t("profile.notificationSettings")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      {t("profile.emailNotifications")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("profile.emailNotificationsDescription")}
                    </div>
                  </div>
                  {profile.notificationSettings?.email ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      {t("profile.smsNotifications")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("profile.smsNotificationsDescription")}
                    </div>
                  </div>
                  {profile.notificationSettings?.sms ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                {t("profile.accountInfo")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">
                    {t("profile.role")}
                  </div>
                  <div className="font-medium">
                    <Badge
                      variant={profile.role === "admin" ? "default" : "outline"}
                    >
                      {t(`profile.roles.${profile.role}`)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-muted-foreground">
                    {t("profile.createdAt")}
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(profile.createdAt, isRtl ? "fa-IR" : "en-US")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>{t("profile.phone")}</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      value={profile.phone}
                      disabled
                      className="bg-muted"
                    />
                    {profile.verified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        {t("profile.verified")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.phoneCannotBeChanged")}
                  </p>
                </div>

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.email")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.company")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.userType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("profile.selectUserType")}
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
                  control={profileForm.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.nationalId")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  {t("profile.notificationSettings")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="notificationSettings.email"
                    render={({ field }) => (
                      <FormItem className="space-y-0 border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t("profile.emailNotifications")}
                            </FormLabel>
                            <FormDescription>
                              {t("profile.emailNotificationsDescription")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div
                              data-state={field.value ? "checked" : "unchecked"}
                              onClick={() => field.onChange(!field.value)}
                              className={`h-6 w-11 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                                field.value ? "bg-primary" : "bg-muted"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  field.value
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="notificationSettings.sms"
                    render={({ field }) => (
                      <FormItem className="space-y-0 border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {t("profile.smsNotifications")}
                            </FormLabel>
                            <FormDescription>
                              {t("profile.smsNotificationsDescription")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div
                              data-state={field.value ? "checked" : "unchecked"}
                              onClick={() => field.onChange(!field.value)}
                              className={`h-6 w-11 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                                field.value ? "bg-primary" : "bg-muted"
                              }`}
                            >
                              <div
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  field.value
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <Loader size="sm" variant="spinner" />
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      {t("common.save")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
