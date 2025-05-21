// src/features/divar/components/DivarPostsList.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { DivarPost } from "@/api/types/divar.types";
import { DivarPostCard } from "./DivarPostCard";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Receipt, AlertCircle } from "lucide-react";

interface DivarPostsListProps {
  posts: DivarPost[];
  isLoading: boolean;
  error: Error | null;
  selectedProductId: string | null;
  onAddAddon: (postToken: string) => void;
  onRemoveAddon: (postToken: string) => void;
  isAddingAddon: boolean;
  isRemovingAddon: boolean;
}

export function DivarPostsList({
  posts,
  isLoading,
  error,
  selectedProductId,
  onAddAddon,
  onRemoveAddon,
  isAddingAddon,
  isRemovingAddon,
}: DivarPostsListProps) {
  const { t } = useLanguage();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("divar.error.fetchFailed")}</AlertTitle>
        <AlertDescription>
          {error.message || t("common.error.general")}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium">{t("divar.noPosts")}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {t("divar.noPostsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <DivarPostCard
          key={post.token}
          post={post}
          selectedProductId={selectedProductId}
          onAddAddon={onAddAddon}
          onRemoveAddon={onRemoveAddon}
          isAddingAddon={isAddingAddon}
          isRemovingAddon={isRemovingAddon}
        />
      ))}
    </div>
  );
}
