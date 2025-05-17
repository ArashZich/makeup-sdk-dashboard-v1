// src/features/sdk/components/SdkFeaturesCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SdkFeatures } from "@/api/types/packages.types";
import { Check, X } from "lucide-react";

interface SdkFeaturesCardProps {
  sdkFeatures: SdkFeatures;
}

export function SdkFeaturesCard({ sdkFeatures }: SdkFeaturesCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("sdk.features")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ویژگی‌های پرمیوم */}
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium">{t("sdk.premiumStatus")}</h3>
              <div className="ml-2">
                {sdkFeatures.isPremium ? (
                  <Badge
                    variant="default"
                    className="bg-primary text-primary-foreground"
                  >
                    {t("sdk.premium")}
                  </Badge>
                ) : (
                  <Badge variant="outline">{t("sdk.standard")}</Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("sdk.projectType")}: {sdkFeatures.projectType}
            </p>
          </div>

          {/* لیست ویژگی‌ها */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              {t("sdk.enabledFeatures")}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sdkFeatures.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ویژگی‌های مدیا */}
          {sdkFeatures.mediaFeatures && (
            <div>
              <h3 className="text-sm font-medium mb-3">
                {t("sdk.mediaFeatures")}
              </h3>
              <div className="space-y-4">
                {/* منابع مجاز */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {t("sdk.allowedSources")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sdkFeatures.mediaFeatures.allowedSources.map(
                      (source, index) => (
                        <Badge key={index} variant="secondary">
                          {source}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                {/* نماهای مجاز */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {t("sdk.allowedViews")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sdkFeatures.mediaFeatures.allowedViews.map(
                      (view, index) => (
                        <Badge key={index} variant="secondary">
                          {view}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                {/* حالت‌های مقایسه */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    {t("sdk.comparisonModes")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sdkFeatures.mediaFeatures.comparisonModes.map(
                      (mode, index) => (
                        <Badge key={index} variant="secondary">
                          {mode}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* الگوها */}
          {sdkFeatures.patterns &&
            Object.keys(sdkFeatures.patterns).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">
                  {t("sdk.patterns")}
                </h3>
                <div className="space-y-3">
                  {Object.entries(sdkFeatures.patterns).map(
                    ([pattern, values], index) => (
                      <div key={index}>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          {pattern}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value, valueIndex) => (
                            <Badge key={valueIndex} variant="outline">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
