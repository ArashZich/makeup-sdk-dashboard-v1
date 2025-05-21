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
import { showToast } from "@/lib/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Check if user is connected to Divar
  const isDivarConnected = !!profile?.divarTokens?.accessToken;

  // Get divar posts
  const {
    getDivarPosts,
    addAddonToPost,
    removeAddonFromPost,
    isAddingAddon,
    isRemovingAddon,
  } = useDivar();

  // Get user's products
  const { getUserProducts } = useProducts();

  // Fetch divar posts with filters
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = getDivarPosts({
    status: statusFilter,
    hasMakeupVirtualTryOn: addonFilter,
  });

  // Fetch user's products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = getUserProducts();

  // Filter posts by search term
  const filteredPosts =
    searchTerm && postsData?.results
      ? postsData.results.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : postsData?.results || [];

  // Handle status filter change
  const handleStatusFilterChange = (
    status: "active" | "inactive" | "expired" | null
  ) => {
    setStatusFilter(status === null ? undefined : status);
  };

  // Handle addon filter change
  const handleAddonFilterChange = (hasAddon: boolean | null) => {
    setAddonFilter(hasAddon === null ? undefined : hasAddon);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle product selection
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
  };

  // Handle add addon to post
  const handleAddAddon = async (postToken: string) => {
    if (!selectedProductId) {
      showToast.error(t("divar.error.noProductSelected"));
      return;
    }

    try {
      await addAddonToPost({
        postToken,
        data: { product_id: selectedProductId },
      });
      refetchPosts();
    } catch (error) {
      console.error("Error adding addon:", error);
    }
  };

  // Handle remove addon from post
  const handleRemoveAddon = async (postToken: string) => {
    try {
      await removeAddonFromPost(postToken);
      refetchPosts();
    } catch (error) {
      console.error("Error removing addon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("divar.title")}
        </h1>
        <p className="text-muted-foreground">{t("divar.description")}</p>
      </div>

      <DivarConnectCard />

      {isDivarConnected && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <DivarPostFilters
              onStatusChange={handleStatusFilterChange}
              onAddonFilterChange={handleAddonFilterChange}
              onSearch={handleSearch}
            />

            <div className="w-full sm:w-64">
              <div className="text-sm font-medium mb-2">
                {t("divar.selectProduct")}
              </div>
              <Select
                value={selectedProductId || ""}
                onValueChange={handleProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("divar.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProducts ? (
                    <SelectItem value="loading" disabled>
                      {t("common.loading")}
                    </SelectItem>
                  ) : productsError ? (
                    <SelectItem value="error" disabled>
                      {t("common.error.general")}
                    </SelectItem>
                  ) : productsData?.results &&
                    productsData.results.length > 0 ? (
                    productsData.results.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      {t("products.noProducts")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t("divar.selectProductDescription")}
              </p>
            </div>
          </div>

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
              isAddingAddon={isAddingAddon}
              isRemovingAddon={isRemovingAddon}
            />
          </div>
        </>
      )}
    </div>
  );
}
