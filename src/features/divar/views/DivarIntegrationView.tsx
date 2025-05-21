// src/features/divar/views/DivarIntegrationView.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDivar } from "@/api/hooks/useDivar";
import { useProducts } from "@/api/hooks/useProducts";
import { useUserProfile } from "@/api/hooks/useUsers"; // استفاده از هوک پروفایل کاربر
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
  const { profile } = useUserProfile(); // دریافت اطلاعات کاربر از جمله توکن دیوار
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

  const {
    getDivarPosts,
    addAddonToPost,
    removeAddonFromPost,
    isAddingAddon, // این دیگر به صورت مستقیم استفاده نمی‌شود
    isRemovingAddon, // این دیگر به صورت مستقیم استفاده نمی‌شود
  } = useDivar();

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

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = getUserProducts();

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

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleAddAddon = async (postToken: string) => {
    if (!selectedProductId) {
      showToast.error(t("divar.error.noProductSelected"));
      return;
    }
    setProcessingAddonToken(postToken); // تنظیم توکن در حال پردازش
    try {
      await addAddonToPost({
        postToken,
        data: { product_id: selectedProductId },
      });
      refetchPosts();
    } catch (error) {
      console.error("Error adding addon:", error);
    } finally {
      setProcessingAddonToken(null); // پاک کردن توکن پس از اتمام
    }
  };

  const handleRemoveAddon = async (postToken: string) => {
    setProcessingRemoveToken(postToken); // تنظیم توکن در حال پردازش
    try {
      await removeAddonFromPost(postToken);
      refetchPosts();
    } catch (error) {
      console.error("Error removing addon:", error);
    } finally {
      setProcessingRemoveToken(null); // پاک کردن توکن پس از اتمام
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
              isAddingAddonForToken={processingAddonToken} // پاس دادن توکن در حال پردازش
              isRemovingAddonForToken={processingRemoveToken} // پاس دادن توکن در حال پردازش
            />
          </div>
        </>
      )}
    </div>
  );
}
