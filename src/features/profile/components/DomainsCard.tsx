// src/features/profile/components/DomainsCard.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import { Building2, InfoIcon, SaveIcon, XIcon } from "lucide-react";
import { showToast } from "@/lib/toast";

// Schema for domain form - اصلاح شده برای پذیرش انواع مختلف دامنه از جمله wildcard
const domainFormSchema = z.object({
  domain: z
    .string()
    .min(1, { message: "Domain is required." })
    .refine(
      (value) => {
        // پذیرش انواع مختلف دامنه:
        // - دامنه اصلی: example.com
        // - زیردامنه: subdomain.example.com
        // - زیردامنه چندسطحی: api.v1.example.com
        // - wildcard domains: *.example.com, *.armogroup.tech
        // - localhost و IP (برای development)
        // - پورت: localhost:3000, example.com:8080

        // Wildcard domain regex: *.example.com
        const wildcardRegex =
          /^\*\.([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})(\:[0-9]{1,5})?$/;

        // Regular domain regex
        const domainRegex =
          /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})?(\:[0-9]{1,5})?$/;

        // localhost regex
        const localhostRegex = /^localhost(\:[0-9]{1,5})?$/;

        // IP address regex
        const ipRegex =
          /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\:[0-9]{1,5})?$/;

        return (
          wildcardRegex.test(value) ||
          domainRegex.test(value) ||
          localhostRegex.test(value) ||
          ipRegex.test(value)
        );
      },
      {
        message:
          "Please enter a valid domain (e.g., example.com, *.example.com, subdomain.example.com, localhost:3000)",
      }
    ),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

interface DomainsCardProps {
  initialDomains: string[];
  isUpdatingDomains: boolean;
  onUpdateDomains: (domains: string[]) => Promise<void>;
}

export function DomainsCard({
  initialDomains,
  isUpdatingDomains,
  onUpdateDomains,
}: DomainsCardProps) {
  const { t } = useLanguage();
  const [domains, setDomains] = useState<string[]>(initialDomains);

  // Domain form
  const domainForm = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain: "",
    },
  });

  // Helper function برای normalize کردن دامنه
  const normalizeDomain = (domain: string): string => {
    let normalized = domain.toLowerCase().trim();

    // حذف http:// یا https:// اگر وجود داشته باشد
    normalized = normalized.replace(/^https?:\/\//, "");

    // حذف trailing slash
    normalized = normalized.replace(/\/$/, "");

    return normalized;
  };

  // Handle domain form submit
  const handleDomainSubmit = async (values: DomainFormValues) => {
    if (!values.domain) return;

    // Normalize کردن دامنه
    const normalizedDomain = normalizeDomain(values.domain);

    // بررسی duplicate
    if (domains.some((d) => normalizeDomain(d) === normalizedDomain)) {
      showToast.error(t("profile.domainExists"));
      return;
    }

    const newDomains = [...domains, normalizedDomain];
    setDomains(newDomains);

    // Reset form
    domainForm.reset();

    showToast.success(t("profile.domainAdded") || "Domain added successfully");
  };

  // Handle domain removal
  const handleRemoveDomain = (domain: string) => {
    const newDomains = domains.filter((d) => d !== domain);
    setDomains(newDomains);
  };

  // Handle domains update
  const handleUpdateDomains = async () => {
    try {
      await onUpdateDomains(domains);
      showToast.success(t("profile.domainsUpdateSuccess"));
    } catch (error) {
      showToast.error(t("profile.domainsUpdateError"));
    }
  };

  // بررسی اینکه آیا تغییراتی نسبت به حالت اولیه وجود دارد
  const hasChanges =
    JSON.stringify(domains.sort()) !== JSON.stringify(initialDomains.sort());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.allowedDomains")}</CardTitle>
        <CardDescription>
          {t("profile.allowedDomainsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>{t("profile.domainRestriction")}</AlertTitle>
            <AlertDescription>
              {t("profile.domainRestrictionDescription")}
            </AlertDescription>
          </Alert>

          <Form {...domainForm}>
            <form
              onSubmit={domainForm.handleSubmit(handleDomainSubmit)}
              className="space-y-4"
            >
              <FormField
                control={domainForm.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("profile.addDomain")}</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder={
                            t("profile.domainPlaceholder") ||
                            "example.com, *.armogroup.tech, subdomain.example.com, localhost:3000"
                          }
                          {...field}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="submit">{t("profile.addDomain")}</Button>
                    </div>
                    <FormDescription>
                      {t("profile.domainFormatWildcard") ||
                        "You can add main domains, wildcard domains (*.example.com), subdomains, localhost, or IP addresses"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("profile.yourDomains")}</h3>

            {domains.length > 0 ? (
              <div className="space-y-2">
                {domains.map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{domain}</span>
                      {/* نمایش نوع دامنه */}
                      {domain.startsWith("*.") && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {t("profile.domainTypes.wildcard") || "Wildcard"}
                        </span>
                      )}
                      {domain.includes("localhost") && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {t("profile.domainTypes.development") ||
                            "Development"}
                        </span>
                      )}
                      {domain.match(/^\d+\.\d+\.\d+\.\d+/) && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {t("profile.domainTypes.ip") || "IP Address"}
                        </span>
                      )}
                      {domain.split(".").length > 2 &&
                        !domain.includes("localhost") &&
                        !domain.startsWith("*.") && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {t("profile.domainTypes.subdomain") || "Subdomain"}
                          </span>
                        )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">
                  {t("profile.noDomainsAdded")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("profile.noDomainsAddedDescription")}
                </p>
              </div>
            )}
          </div>

          {hasChanges && (
            <div className="flex justify-end">
              <Button
                onClick={handleUpdateDomains}
                disabled={isUpdatingDomains}
                className="min-w-[120px]"
              >
                {isUpdatingDomains ? (
                  <Loader size="sm" variant="spinner" />
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {t("profile.saveDomains")}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
