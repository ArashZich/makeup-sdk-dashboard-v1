// src/features/profile/views/ProfileView.tsx
"use client";

import { useState } from "react";
import { useUserProfile } from "@/api/hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";
import { UpdateProfileRequest } from "@/api/types/users.types";
import { PersonalInfoCard } from "../components/PersonalInfoCard";
import { DomainsCard } from "../components/DomainsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/common/Loader";
import { InfoIcon, User, Building2 } from "lucide-react";

export function ProfileView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");

  // API hooks
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    updateDomains,
    isUpdatingProfile,
    isUpdatingDomains,
  } = useUserProfile();

  // Handle profile update
  const handleUpdateProfile = async (
    data: UpdateProfileRequest
  ): Promise<void> => {
    await updateProfile(data);
  };

  // Handle domains update
  const handleUpdateDomains = async (domains: string[]): Promise<void> => {
    await updateDomains({ domains });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("profile.error.title")}</AlertTitle>
        <AlertDescription>{t("profile.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground">{t("profile.description")}</p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("profile.tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t("profile.tabs.domains")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <PersonalInfoCard
            profile={profile}
            isUpdatingProfile={isUpdatingProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-6 mt-6">
          <DomainsCard
            initialDomains={profile.allowedDomains || []}
            isUpdatingDomains={isUpdatingDomains}
            onUpdateDomains={handleUpdateDomains}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
