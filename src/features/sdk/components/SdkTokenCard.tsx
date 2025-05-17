// src/features/sdk/components/SdkTokenCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, EyeIcon, EyeOffIcon } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard"; // استفاده از هوک جدید
import { useBoolean } from "@/hooks/useBoolean"; // استفاده از هوک جدید

interface SdkTokenCardProps {
  token: string;
  packageId: string;
}

export function SdkTokenCard({ token, packageId }: SdkTokenCardProps) {
  const { t } = useLanguage();

  // استفاده از هوک useBoolean برای نمایش/مخفی کردن توکن
  const { getValue, toggle } = useBoolean({
    showToken: false,
  });

  // استفاده از هوک useClipboard برای کپی توکن
  const { isCopied, copyToClipboard } = useClipboard({
    successMessage: t("sdk.tokenCopied"),
    timeout: 2000,
  });

  const handleCopy = () => {
    copyToClipboard(token);
  };

  // نمایش بخشی از توکن + ستاره برای مخفی کردن
  const displayToken = getValue("showToken")
    ? token
    : token.substring(0, 12) + "••••••••" + token.substring(token.length - 8);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{t("sdk.sdkToken")}</span>
          <Button variant="ghost" size="sm" onClick={() => toggle("showToken")}>
            {getValue("showToken") ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <CardDescription>{t("sdk.tokenDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground mb-1">
            {t("sdk.packageId")}: {packageId}
          </p>

          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                value={displayToken}
                readOnly
                className="pr-10 font-mono text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-10 w-10"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              {t("sdk.tokenSecurityWarning")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
