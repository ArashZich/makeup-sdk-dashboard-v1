// src/features/divar/views/DivarIntegrationView.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDivar } from "@/api/hooks/useDivar";
import { useProducts } from "@/api/hooks/useProducts";
import { useUserProfile } from "@/api/hooks/useUsers";
import { DivarPostFilters } from "../components/DivarPostFilters";
import { DivarPostsList } from "../components/DivarPostsList";
import { DivarConnectCard } from "../components/DivarConnectCard";
import { ProductSelectorCard } from "../components/ProductSelectorCard";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";

export function DivarIntegrationView() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "expired" | undefined
  >(undefined);
  const [addonFilter, setAddonFilter] = useState<boolean | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
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

  // ✅ تغییر شده: استفاده از getUserProducts که Infinite Query برمی‌گردونه
  const { getUserProducts } = useProducts();

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = getDivarPosts({
    status: statusFilter,
    hasMakeupVirtualTryOn: addonFilter,
  });

  // ✅ تغییر شده: دریافت محصولات با infinite query
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = getUserProducts(); // بدون فیلتر - همه محصولات

  const filteredPosts =
    searchTerm && postsData?.results
      ? postsData.results.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : postsData?.results || [];

  const handleStatusFilterChange = (
    status: "active" | "inactive" | "expired" | null
  ) => {
    setStatusFilter(status === null ? undefined : status);
  };

  const handleAddonFilterChange = (hasAddon: boolean | null) => {
    setAddonFilter(hasAddon === null ? undefined : hasAddon);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

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
            productsData={productsData} // ✅ تغییر شده: حالا کل data structure پاس می‌دیم
            selectedProductId={selectedProductId}
            onProductSelect={handleProductSelect}
            isLoading={isLoadingProducts}
          />
        </div>
      )}

      {/* فیلترها و لیست آگهی‌ها - فقط اگر دیوار متصل باشه */}
      {isDivarConnected && (
        <>
          {/* فیلترهای آگهی‌ها */}
          <div>
            <DivarPostFilters
              onStatusChange={handleStatusFilterChange}
              onAddonFilterChange={handleAddonFilterChange}
              onSearch={handleSearch}
            />
          </div>

          {/* لیست آگهی‌ها */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">{t("divar.yourPosts")}</h2>
              {postsData && (
                <span className="text-sm text-muted-foreground">
                  {t("divar.postsCount", { count: postsData.totalResults })}
                </span>
              )}
            </div>

            <DivarPostsList
              posts={filteredPosts}
              isLoading={isLoadingPosts}
              error={postsError as Error | null}
              selectedProductId={selectedProductId}
              onAddAddon={handleAddAddon}
              onRemoveAddon={handleRemoveAddon}
              isAddingAddonForToken={processingAddonToken}
              isRemovingAddonForToken={processingRemoveToken}
            />
          </div>
        </>
      )}
    </div>
  );
}
