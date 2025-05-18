// src/features/settings/components/NotificationSettings.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettingsStore } from "@/store/settings.store";
import { useUserProfile } from "@/api/hooks/useUsers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { AlertCircle, Bell, Mail, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotificationSettings() {
  const { t } = useLanguage();
  const { emailNotifications, smsNotifications, setNotificationSettings } =
    useSettingsStore();

  const { profile, updateProfile, isUpdatingProfile } = useUserProfile();

  const [email, setEmail] = useState(emailNotifications);
  const [sms, setSms] = useState(smsNotifications);
  const [isDirty, setIsDirty] = useState(false);

  // مدیریت تغییر تنظیمات اطلاع‌رسانی ایمیلی
  const handleEmailChange = (checked: boolean) => {
    setEmail(checked);
    setIsDirty(true);
  };

  // مدیریت تغییر تنظیمات اطلاع‌رسانی پیامکی
  const handleSmsChange = (checked: boolean) => {
    setSms(checked);
    setIsDirty(true);
  };

  // ذخیره تنظیمات اطلاع‌رسانی
  const handleSaveSettings = async () => {
    try {
      // ذخیره در store محلی
      setNotificationSettings(email, sms);

      // ذخیره در API
      if (profile) {
        await updateProfile({
          notificationSettings: {
            email,
            sms,
          },
        });
      }

      setIsDirty(false);
      showToast.success(t("settings.notifications.saveSuccess"));
    } catch (error) {
      console.error("Error saving notification settings:", error);
      showToast.error(t("settings.notifications.saveError"));
    }
  };

  // بررسی اینکه آیا اطلاعات تماس برای اطلاع‌رسانی موجود است
  const hasEmail = !!profile?.email;
  const hasPhone = !!profile?.phone;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.notifications.title")}</CardTitle>
        <CardDescription>
          {t("settings.notifications.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* هشدار عدم وجود ایمیل */}
        {email && !hasEmail && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {t("settings.notifications.emailMissing.title")}
            </AlertTitle>
            <AlertDescription>
              {t("settings.notifications.emailMissing.description")}
            </AlertDescription>
          </Alert>
        )}

        {/* تنظیمات اطلاع‌رسانی ایمیلی */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">
                {t("settings.notifications.email.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.notifications.email.description")}
              </p>
            </div>
          </div>
          <Switch
            checked={email}
            onCheckedChange={handleEmailChange}
            aria-label={t("settings.notifications.email.title")}
          />
        </div>

        {/* تنظیمات اطلاع‌رسانی پیامکی */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">
                {t("settings.notifications.sms.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.notifications.sms.description")}
              </p>
            </div>
          </div>
          <Switch
            checked={sms}
            onCheckedChange={handleSmsChange}
            aria-label={t("settings.notifications.sms.title")}
            disabled={!hasPhone}
          />
        </div>

        {/* هشدار عدم وجود شماره تلفن */}
        {sms && !hasPhone && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {t("settings.notifications.phoneMissing.title")}
            </AlertTitle>
            <AlertDescription>
              {t("settings.notifications.phoneMissing.description")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSaveSettings}
          disabled={!isDirty || isUpdatingProfile}
        >
          {isUpdatingProfile ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              {t("common.saving")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
