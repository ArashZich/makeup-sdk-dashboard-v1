"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/api/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader } from "@/components/common/Loader";
import { User } from "lucide-react";

interface RequiredInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequiredInfoDialog({
  isOpen,
  onClose,
  onSuccess,
}: RequiredInfoDialogProps) {
  const { t } = useLanguage();
  const { updateRequiredInfo, isUpdatingRequiredInfo } = useUserProfile();

  const [userType, setUserType] = useState<"real" | "legal">("real");
  const [nationalId, setNationalId] = useState("");
  const [errors, setErrors] = useState<{ nationalId?: string }>({});

  // Validation
  const validateForm = () => {
    const newErrors: { nationalId?: string } = {};

    if (!nationalId.trim()) {
      newErrors.nationalId = t("profile.nationalIdRequired");
    } else if (userType === "real" && nationalId.length !== 10) {
      newErrors.nationalId = t("profile.nationalIdInvalid");
    } else if (userType === "legal" && nationalId.length < 8) {
      newErrors.nationalId = t("profile.companyIdInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await updateRequiredInfo({
        userType,
        nationalId: nationalId.trim(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      // خطا در hook مدیریت می‌شود
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isUpdatingRequiredInfo) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mt-4">
            <User className="h-5 w-5" />
            {t("profile.requiredInfo")}
          </DialogTitle>
          <DialogDescription className="text-start">
            {t("profile.requiredInfoDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* نوع کاربر */}
          <div className="space-y-3">
            <Label>{t("profile.userType")}</Label>
            <RadioGroup
              value={userType}
              onValueChange={(value: "real" | "legal") => setUserType(value)}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real" id="real" />
                <Label htmlFor="real" className="cursor-pointer">
                  {t("profile.userTypes.real")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legal" id="legal" />
                <Label htmlFor="legal" className="cursor-pointer">
                  {t("profile.userTypes.legal")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* کد ملی / شناسه ملی */}
          <div className="space-y-2">
            <Label htmlFor="nationalId">
              {userType === "real"
                ? t("profile.nationalId")
                : t("profile.companyId")}
            </Label>
            <Input
              id="nationalId"
              value={nationalId}
              onChange={(e) => {
                setNationalId(e.target.value);
                if (errors.nationalId) {
                  setErrors({ ...errors, nationalId: undefined });
                }
              }}
              placeholder={
                userType === "real"
                  ? t("profile.nationalIdPlaceholder")
                  : t("profile.companyIdPlaceholder")
              }
              disabled={isUpdatingRequiredInfo}
              className={errors.nationalId ? "border-red-500" : ""}
            />
            {errors.nationalId && (
              <p className="text-sm text-red-500">{errors.nationalId}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdatingRequiredInfo}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdatingRequiredInfo}>
            {isUpdatingRequiredInfo ? (
              <Loader size="sm" variant="spinner" />
            ) : (
              t("common.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
