// src/features/divar/components/DivarConnectCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/api/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { ExternalLink, LinkIcon, CheckCircle } from "lucide-react";

export function DivarConnectCard() {
  const { t } = useLanguage();
  const { profile, isLoading } = useUserProfile();

  // Check if user is connected to Divar
  const isDivarConnected = !!profile?.divarTokens?.accessToken;

  if (isLoading) {
    return (
      <Card className="max-w-sm">
        <CardContent className="p-4 flex justify-center">
          <Loader size="sm" text="common.loading" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          {t("divar.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isDivarConnected ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="h-4 w-4" />
              {t("divar.alreadyConnected")}
              <span className="text-sm text-muted-foreground font-normal">
                ({profile?.name || profile?.phone})
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open("https://divar.ir/my-divar", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("divar.viewOnDivar")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("divar.connectWithDivarDescription")}
            </p>
            <Button size="sm" className="w-full sm:w-auto">
              <LinkIcon className="h-4 w-4 mr-2" />
              {t("divar.connectWithDivar")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
