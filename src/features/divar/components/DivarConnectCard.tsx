// src/features/divar/components/DivarConnectCard.tsx (اصلاح شده)
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/api/hooks/useUsers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { ExternalLink, LinkIcon } from "lucide-react";

export function DivarConnectCard() {
  const { t } = useLanguage();
  const { profile, isLoading } = useUserProfile();

  // Check if user is connected to Divar
  const isDivarConnected = !!profile?.divarTokens?.accessToken;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <Loader size="md" text="common.loading" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("divar.title")}</CardTitle>
        <CardDescription>{t("divar.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isDivarConnected ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <LinkIcon className="h-5 w-5" />
              {t("divar.alreadyConnected")}
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              {t("divar.connectedAs")}: {profile?.name || profile?.phone}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              {t("divar.connectWithDivarDescription")}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {isDivarConnected && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => window.open("https://divar.ir/my-divar", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("divar.viewOnDivar")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
