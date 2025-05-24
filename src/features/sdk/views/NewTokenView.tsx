// src/features/sdk/views/NewTokenView.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserPackages } from "@/api/hooks/usePackages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClipboard } from "@/hooks/useClipboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import {
  CheckCircle,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  InfoIcon,
} from "lucide-react";
import confetti from "canvas-confetti";

export function NewTokenView() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getUserPackages } = useUserPackages();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [packageId, setPackageId] = useState<string>("");

  // استفاده از پارامترهای URL
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  // استفاده از هوک useClipboard برای کپی توکن
  const { isCopied, copyToClipboard } = useClipboard({
    successMessage: t("sdk.tokenCopied"),
    timeout: 2000,
  });

  // دریافت اطلاعات بسته بعد از پرداخت موفق
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        if (status === "success" || !status) {
          // دریافت بسته‌های فعال کاربر
          const packagesResult = getUserPackages("active");
          const packagesData = await packagesResult.data;

          // تغییر: استفاده از results
          const packages = packagesData?.results;

          // بررسی وجود بسته فعال
          if (packages && packages.length > 0) {
            // مرتب‌سازی بر اساس تاریخ ایجاد (جدیدترین اول)
            const sortedPackages = [...packages].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

            // استفاده از اولین بسته (جدیدترین)
            const latestPackage = sortedPackages[0];
            setToken(latestPackage.token);
            setPackageId(latestPackage._id);

            // اجرای confetti برای نمایش تبریک
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            }, 500);
          } else {
            setError(t("sdk.noActivePackage"));
          }
        } else if (status === "failed" || status === "canceled") {
          setError(t("payments.paymentFailed"));
        }
      } catch (error) {
        console.error("Error fetching package:", error);
        setError(t("sdk.error.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [paymentId, status, getUserPackages, t]);

  const handleCopy = () => {
    copyToClipboard(token);
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToSdk = () => {
    router.push("/dashboard/sdk");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t("sdk.error.title")}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
          <Button onClick={handleGoToDashboard}>
            {t("dashboard.backToDashboard")}
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {t("sdk.activationSuccess")}
        </h1>
        <p className="text-muted-foreground">
          {t("sdk.activationDescription")}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("sdk.yourSdkToken")}</CardTitle>
          <CardDescription>{t("sdk.tokenImportance")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>{t("sdk.important")}</AlertTitle>
              <AlertDescription>{t("sdk.saveTokenWarning")}</AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  value={token}
                  readOnly
                  className="pr-10 font-mono text-sm bg-muted"
                />
              </div>
              <Button onClick={handleCopy} className="gap-2">
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {isCopied ? t("common.copied") : t("common.copy")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("sdk.packageId")}: {packageId}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 flex-wrap">
          <Button variant="outline" onClick={handleGoToDashboard}>
            {isRtl ? (
              <>
                {t("dashboard.backToDashboard")}
                <ArrowRight className="ms-2 h-4 w-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("dashboard.backToDashboard")}
              </>
            )}
          </Button>
          <Button onClick={handleGoToSdk}>{t("sdk.manageSDK")}</Button>
        </CardFooter>
      </Card>

      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-medium mb-2">{t("sdk.nextSteps")}</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">
              1
            </div>
            <span>{t("sdk.nextStep1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">
              2
            </div>
            <span>{t("sdk.nextStep2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">
              3
            </div>
            <span>{t("sdk.nextStep3")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
