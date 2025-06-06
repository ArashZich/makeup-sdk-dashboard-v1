// src/features/divar/views/DivarIntegrationView.tsx
"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDivar } from "@/api/hooks/useDivar";
import { useProducts } from "@/api/hooks/useProducts";
import { useUserProfile } from "@/api/hooks/useUsers";
import { useDebouncedSearch } from "@/hooks/useDebounce";
import { DivarSimpleSearch } from "../components/DivarSimpleSearch";
import { DivarPostsList } from "../components/DivarPostsList";
import { DivarConnectCard } from "../components/DivarConnectCard";
import { ProductSelectorCard } from "../components/ProductSelectorCard";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";

export function DivarIntegrationView() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // استفاده از هوک debounced search
  const { searchTerm, debouncedSearchTerm, setSearchTerm } = useDebouncedSearch(
    "",
    300
  );

  // State برای مدیریت توکن آگهی در حال پردازش
  const [processingAddonToken, setProcessingAddonToken] = useState<
    string | null
  >(null);
  const [processingRemoveToken, setProcessingRemoveToken] = useState<
    string | null
  >(null);

  const isDivarConnected = !!profile?.divarTokens?.accessToken;

  const { getDivarPosts, addAddonToPost, removeAddonFromPost } = useDivar();

  // دریافت محصولات کاربر
  const { getUserProducts } = useProducts();

  // دریافت آگهی‌های دیوار بدون فیلتر
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = getDivarPosts({});

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = getUserProducts();

  // فیلتر کردن آگهی‌ها بر اساس جستجوی debounced
  const filteredPosts = useMemo(() => {
    if (!postsData?.results) return [];

    if (!debouncedSearchTerm.trim()) {
      return postsData.results;
    }

    return postsData.results.filter((post) =>
      post.title
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase().trim())
    );
  }, [postsData?.results, debouncedSearchTerm]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleAddAddon = async (postToken: string) => {
    if (!selectedProductId) {
      showToast.error(t("divar.error.noProductSelected"));
      return;
    }
    setProcessingAddonToken(postToken);
    try {
      await addAddonToPost({
        postToken,
        data: { product_id: selectedProductId },
      });
      refetchPosts();
    } catch (error) {
      logger.error("Error adding addon:", error);
    } finally {
      setProcessingAddonToken(null);
    }
  };

  const handleRemoveAddon = async (postToken: string) => {
    setProcessingRemoveToken(postToken);
    try {
      await removeAddonFromPost(postToken);
      refetchPosts();
    } finally {
      setProcessingRemoveToken(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("divar.title")}
        </h1>
        <p className="text-muted-foreground">{t("divar.description")}</p>
      </div>

      {/* کارت اتصال دیوار */}
      <DivarConnectCard />

      {/* انتخاب محصول - فقط اگر دیوار متصل باشه */}
      {isDivarConnected && (
        <div className="w-full">
          <ProductSelectorCard
            productsData={productsData}
            selectedProductId={selectedProductId}
            onProductSelect={handleProductSelect}
            isLoading={isLoadingProducts}
          />
        </div>
      )}

      {/* جستجو و لیست آگهی‌ها - فقط اگر دیوار متصل باشه */}
      {isDivarConnected && (
        <>
          {/* هدر و جستجو */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium">{t("divar.yourPosts")}</h2>
                {postsData && (
                  <p className="text-sm text-muted-foreground">
                    {t("divar.postsCount", { count: postsData.totalResults })}
                    {debouncedSearchTerm && (
                      <span className="ml-2">
                        •{" "}
                        {t("divar.searchResults", {
                          found: filteredPosts.length,
                          total: postsData.totalResults,
                        })}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* کامپوننت جستجو */}
              <DivarSimpleSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder={t("divar.searchPlaceholder")}
              />
            </div>
          </div>

          {/* لیست آگهی‌ها */}
          <div>
            <DivarPostsList
              posts={filteredPosts}
              isLoading={isLoadingPosts}
              error={postsError as Error | null}
              selectedProductId={selectedProductId}
              onAddAddon={handleAddAddon}
              onRemoveAddon={handleRemoveAddon}
              isAddingAddonForToken={processingAddonToken}
              isRemovingAddonForToken={processingRemoveToken}
              isSearchActive={!!debouncedSearchTerm.trim()}
              searchTerm={debouncedSearchTerm}
              totalPosts={postsData?.totalResults || 0}
            />
          </div>
        </>
      )}
    </div>
  );
}
