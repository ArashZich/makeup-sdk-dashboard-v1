// src/features/admin/users/views/UserDetailsView.tsx
"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/Loader";
import { BackButtonIcon } from "@/components/common/BackButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib";
import {
  Edit,
  Trash,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  Calendar,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { useBoolean } from "@/hooks/useBoolean";

export function UserDetailsView() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;

  const { getValue, toggle } = useBoolean({
    showDeleteDialog: false,
  });

  const { getUser, deleteUser, isDeletingUser } = useAdminUsers();

  const { data: user, isLoading, error } = getUser(userId || "");

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser(user._id);
      router.push("/dashboard/admin/users");
    } catch (error) {
      logger.error("Error deleting user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("common.error.title")}</AlertTitle>
        <AlertDescription>{t("common.error.fetchFailed")}</AlertDescription>
        <BackButtonIcon href="/dashboard/admin/users" />
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center">
          <BackButtonIcon href="/dashboard/admin/users" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground flex items-center">
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {t(`profile.roles.${user.role}`)}
              </Badge>
              {user.verified ? (
                <Badge variant="success" className="ml-2">
                  <Check className="h-3 w-3 mr-1" />
                  {t("admin.users.verified")}
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">
                  <X className="h-3 w-3 mr-1" />
                  {t("admin.users.notVerified")}
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/admin/users/edit/${user._id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => toggle("showDeleteDialog")}
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* اطلاعات اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
            <CardDescription>
              {t("profile.personalInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">{t("common.name")}:</span>
              {user.name}
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">{t("common.phone")}:</span>
              {user.phone}
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">{t("common.email")}:</span>
              {user.email || t("profile.notProvided")}
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">{t("profile.company")}:</span>
              {user.company || t("profile.notProvided")}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">{t("profile.userType")}:</span>
              {user.userType
                ? t(`profile.userTypes.${user.userType}`)
                : t("profile.notProvided")}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">
                {t("profile.createdAt")}:
              </span>
              {formatDate(user.createdAt, isRtl ? "fa-IR" : "en-US")}
            </div>
          </CardContent>
        </Card>

        {/* تنظیمات اطلاع‌رسانی و دامنه‌ها */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.notificationSettings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t("profile.emailNotifications")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.emailNotificationsDescription")}
                  </p>
                </div>
                {user.notificationSettings?.email ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500"
                  >
                    {t("common.active")}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground"
                  >
                    {t("common.inactive")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("profile.smsNotifications")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.smsNotificationsDescription")}
                  </p>
                </div>
                {user.notificationSettings?.sms ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500"
                  >
                    {t("common.active")}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground"
                  >
                    {t("common.inactive")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("profile.allowedDomains")}</CardTitle>
              <CardDescription>
                {t("profile.allowedDomainsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.allowedDomains && user.allowedDomains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.allowedDomains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                    >
                      <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
                      {domain}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("profile.noDomainsAdded")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* دیالوگ حذف کاربر */}
      <DeleteUserDialog
        user={user}
        isOpen={getValue("showDeleteDialog")}
        isDeleting={isDeletingUser}
        onConfirm={handleDelete}
        onCancel={() => toggle("showDeleteDialog")}
      />
    </div>
  );
}
