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

// Schema for domain form
const domainFormSchema = z.object({
  domain: z
    .string()
    .min(3, { message: "Domain must be at least 3 characters." }),
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

  // Handle domain form submit
  const handleDomainSubmit = async (values: DomainFormValues) => {
    if (!values.domain) return;

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(values.domain)) {
      showToast.error(t("profile.invalidDomain"));
      return;
    }

    // Add domain if not already exists
    if (domains.includes(values.domain)) {
      showToast.error(t("profile.domainExists"));
      return;
    }

    const newDomains = [...domains, values.domain];
    setDomains(newDomains);

    // Reset form
    domainForm.reset();
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
                          placeholder="example.com"
                          {...field}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="submit">{t("profile.addDomain")}</Button>
                    </div>
                    <FormDescription>
                      {t("profile.domainFormat")}
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
                      <span>{domain}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain)}
                    >
                      <XIcon className="h-4 w-4 text-muted-foreground" />
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

          {domains.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleUpdateDomains}
                disabled={isUpdatingDomains}
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
