// src/features/divar/components/DivarPostsList.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { DivarPost } from "@/api/types/divar.types";
import { DivarPostCard } from "./DivarPostCard";
import { Loader } from "@/components/common/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Receipt, AlertCircle, Search } from "lucide-react";

interface DivarPostsListProps {
  posts: DivarPost[];
  isLoading: boolean;
  error: Error | null;
  selectedProductId: string | null;
  onAddAddon: (postToken: string) => void;
  onRemoveAddon: (postToken: string) => void;
  isAddingAddonForToken: string | null;
  isRemovingAddonForToken: string | null;
  // اضافه کردن props جدید برای نمایش حالت جستجو
  isSearchActive?: boolean;
  searchTerm?: string;
  totalPosts?: number;
}

export function DivarPostsList({
  posts,
  isLoading,
  error,
  selectedProductId,
  onAddAddon,
  onRemoveAddon,
  isAddingAddonForToken,
  isRemovingAddonForToken,
  isSearchActive = false,
  searchTerm = "",
  totalPosts = 0,
}: DivarPostsListProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

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

  // حالت جستجو که نتیجه‌ای ندارد
  if (isSearchActive && posts.length === 0 && searchTerm.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium">{t("divar.noSearchResults")}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {t("divar.noSearchResultsDescription", { term: searchTerm })}
        </p>
      </div>
    );
  }

  // حالت کلی که آگهی وجود ندارد
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
    <div className="space-y-4">
      {/* نمایش تعداد نتایج در صورت جستجو */}
      {isSearchActive && searchTerm.trim() && (
        <div className="text-sm text-muted-foreground">
          {t("divar.searchResults", {
            found: posts.length,
            total: totalPosts,
          })}
        </div>
      )}

      {/* گرید آگهی‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <DivarPostCard
            key={post.token}
            post={post}
            selectedProductId={selectedProductId}
            onAddAddon={onAddAddon}
            onRemoveAddon={onRemoveAddon}
            isAddingAddonForToken={isAddingAddonForToken}
            isRemovingAddonForToken={isRemovingAddonForToken}
          />
        ))}
      </div>
    </div>
  );
}
