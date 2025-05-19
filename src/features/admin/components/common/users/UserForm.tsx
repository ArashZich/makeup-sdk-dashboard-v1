// src/features/admin/components/users/UserForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/api/types/users.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader } from "@/components/common/Loader";
import { showToast } from "@/lib/toast";

interface UserFormProps {
  user?: User;
  isCreating?: boolean;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export function UserForm({
  user,
  isCreating = false,
  onSubmit,
  isSubmitting = false,
}: UserFormProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");
  const [role, setRole] = useState<"user" | "admin">(user?.role || "user");
  const [userType, setUserType] = useState<"real" | "legal" | undefined>(
    user?.userType || "real"
  );
  const [nationalId, setNationalId] = useState(user?.nationalId || "");
  const [emailNotifications, setEmailNotifications] = useState(
    user?.notificationSettings?.email || false
  );
  const [smsNotifications, setSmsNotifications] = useState(
    user?.notificationSettings?.sms || false
  );
  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    user?.allowedDomains || []
  );
  const [newDomain, setNewDomain] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("validation.required");
    }

    if (!phone.trim()) {
      newErrors.phone = t("validation.required");
    } else if (!/^(\+98|0)?9\d{9}$/.test(phone)) {
      newErrors.phone = t("validation.invalidPhone");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("validation.invalidEmail");
    }

    if (userType === "real" && nationalId && nationalId.length !== 10) {
      newErrors.nationalId = t("validation.invalidNationalId");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData: CreateUserRequest | UpdateUserRequest = {
      name,
      phone: isCreating ? phone : undefined, // در ویرایش نمیتوان شماره تلفن را تغییر داد
      email: email || undefined,
      company: company || undefined,
      role,
      userType,
      nationalId: nationalId || undefined,
      notificationSettings: {
        email: emailNotifications,
        sms: smsNotifications,
      },
      allowedDomains,
    };

    try {
      await onSubmit(userData);
      router.push("/dashboard/admin/users");
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleAddDomain = () => {
    if (!newDomain) return;

    // اعتبارسنجی ساده دامنه
    const domainRegex =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      setErrors({
        ...errors,
        domain: t("profile.invalidDomain"),
      });
      return;
    }

    // چک کنیم آیا دامنه قبلاً اضافه شده است
    if (allowedDomains.includes(newDomain)) {
      setErrors({
        ...errors,
        domain: t("profile.domainExists"),
      });
      return;
    }

    setAllowedDomains([...allowedDomains, newDomain]);
    setNewDomain("");
    setErrors({
      ...errors,
      domain: "",
    });
  };

  const handleRemoveDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreating
              ? t("admin.users.createUser")
              : t("admin.users.editUser")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("profile.personalInfo")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.namePlaceholder")}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("common.phone")}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("profile.phonePlaceholder")}
                  required
                  disabled={!isCreating} // فقط در حالت ایجاد قابل تغییر است
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                {!isCreating && (
                  <p className="text-xs text-muted-foreground">
                    {t("profile.phoneCannotBeChanged")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("profile.emailPlaceholder")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">{t("profile.company")}</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t("profile.companyPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("profile.role")}</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as "user" | "admin")}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t("profile.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      {t("profile.roles.user")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {t("profile.roles.admin")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">{t("profile.userType")}</Label>
                <Select
                  value={userType}
                  onValueChange={(value) =>
                    setUserType(value as "real" | "legal")
                  }
                >
                  <SelectTrigger id="userType">
                    <SelectValue placeholder={t("profile.selectUserType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real">
                      {t("profile.userTypes.real")}
                    </SelectItem>
                    <SelectItem value="legal">
                      {t("profile.userTypes.legal")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">{t("profile.nationalId")}</Label>
                <Input
                  id="nationalId"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder={t("profile.nationalIdPlaceholder")}
                />
                {errors.nationalId && (
                  <p className="text-sm text-destructive">
                    {errors.nationalId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("profile.notificationSettings")}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">
                    {t("profile.emailNotifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.emailNotificationsDescription")}
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">
                    {t("profile.smsNotifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.smsNotificationsDescription")}
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("profile.allowedDomains")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("profile.domainRestrictionDescription")}
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder={t("profile.domainFormat")}
                />
                <Button type="button" onClick={handleAddDomain}>
                  {t("profile.addDomain")}
                </Button>
              </div>
              {errors.domain && (
                <p className="text-sm text-destructive">{errors.domain}</p>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {t("profile.yourDomains")}
                </h4>
                {allowedDomains.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("profile.noDomainsAdded")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allowedDomains.map((domain) => (
                      <div
                        key={domain}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary"
                      >
                        <span className="text-sm">{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/admin/users")}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size="sm" className="mr-2" />
                {t("common.saving")}
              </>
            ) : (
              t("common.save")
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
