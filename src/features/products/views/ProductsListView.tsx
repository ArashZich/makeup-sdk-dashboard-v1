// src/features/products/views/ProductsListView.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useProducts } from "@/api/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBoolean } from "@/hooks/useBoolean";
import { Product } from "@/api/types/products.types";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showToast } from "@/lib/toast";
import logger from "@/lib/logger";
import {
  InfoIcon,
  PlusIcon,
  Search,
  LayoutGridIcon,
  TableIcon,
  PackageIcon,
  ShoppingCartIcon,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

export function ProductsListView() {
  const { t } = useLanguage();

  // State management using useBoolean
  const { getValue, setTrue, setFalse } = useBoolean({
    isCreateFormOpen: false,
    isEditFormOpen: false,
    isDeleteDialogOpen: false,
  });

  // State for search and view mode
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // API hooks
  const {
    getUserProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreatingProduct,
    isUpdatingProduct,
    isDeletingProduct,
  } = useProducts();

  // ✅ Infinite Query Hook
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = getUserProducts();

  // ✅ Intersection Observer برای تشخیص انتهای صفحه
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          logger.api("🔄 Loading more products...");
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ✅ تبدیل data به لیست محصولات
  const allProducts = data?.pages.flatMap((page) => page.results) || [];

  // ✅ Check if error is related to no active package
  const isNoActivePackageError = (error as any)?.response?.status === 402;

  // Filter products by search term (client-side)
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create form handlers
  const handleOpenCreateForm = () => {
    logger.api("Opening create product form");
    setSelectedProduct(null);
    setTrue("isCreateFormOpen");
  };

  const handleCloseCreateForm = () => {
    logger.api("Closing create product form");
    setFalse("isCreateFormOpen");
    setSelectedProduct(null);
  };

  // Edit form handlers
  const handleOpenEditForm = (product: Product) => {
    logger.api("Opening edit product form for:", product.name);
    setSelectedProduct(product);
    setTrue("isEditFormOpen");
  };

  const handleCloseEditForm = () => {
    logger.api("Closing edit product form");
    setFalse("isEditFormOpen");
    setSelectedProduct(null);
  };

  // Delete dialog handlers
  const handleOpenDeleteDialog = (product: Product) => {
    logger.api("Opening delete dialog for:", product.name);
    setSelectedProduct(product);
    setTrue("isDeleteDialogOpen");
  };

  const handleCloseDeleteDialog = () => {
    logger.api("Closing delete dialog");
    setFalse("isDeleteDialogOpen");
    setSelectedProduct(null);
  };

  // CRUD operations
  const handleCreateProduct = async (data: any) => {
    try {
      logger.api("Creating product with data:", data);
      await createProduct(data);
      logger.success("Product created successfully");
      showToast.success(t("products.createSuccess"));
      refetch();
      handleCloseCreateForm();
    } catch (error) {
      logger.fail("Error creating product:", error);
      showToast.error(t("products.createError"));
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!selectedProduct) {
      logger.warn("No product selected for update");
      return;
    }

    try {
      logger.api("Updating product:", selectedProduct.name, "with data:", data);
      await updateProduct({
        productId: selectedProduct._id,
        data,
      });
      logger.success("Product updated successfully");
      showToast.success(t("products.updateSuccess"));
      refetch();
      handleCloseEditForm();
    } catch (error) {
      logger.fail("Error updating product:", error);
      showToast.error(t("products.updateError"));
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      logger.warn("No product selected for deletion");
      return;
    }

    try {
      logger.api("Deleting product:", selectedProduct.name);
      await deleteProduct(selectedProduct._id);
      logger.success("Product deleted successfully");
      showToast.success(t("products.deleteSuccess"));
      refetch();
      handleCloseDeleteDialog();
    } catch (error) {
      logger.fail("Error deleting product:", error);
      showToast.error(t("products.deleteError"));
    }
  };

  // View mode handlers
  const handleSetGridView = () => {
    logger.api("Switching to grid view");
    setViewMode("grid");
  };

  const handleSetListView = () => {
    logger.api("Switching to list view");
    setViewMode("list");
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      logger.api("Searching products with term:", value);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" text="common.loading" />
      </div>
    );
  }

  // ✅ No active package error state
  if (isNoActivePackageError) {
    logger.warn("User has no active package");
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("products.title")}
            </h1>
            <p className="text-muted-foreground">{t("products.description")}</p>
          </div>
        </div>

        {/* No Package Alert */}
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <ShoppingCartIcon className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            {t("dashboard.noPlanTitle")}
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            {t("dashboard.noPlanDescription")}
          </AlertDescription>
        </Alert>

        {/* Call to Action */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
            <PackageIcon className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {t("packages.noActivePackages")}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {t("packages.noActivePackagesDescription")}
          </p>
          <Button asChild>
            <Link href="/dashboard/plans">
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              {t("plans.viewAllPlans")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Other error states
  if (error && !isNoActivePackageError) {
    logger.fail("Error loading products:", error);
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("products.error.title")}</AlertTitle>
        <AlertDescription>{t("products.error.fetchFailed")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("products.title")}
          </h1>
          <p className="text-muted-foreground">{t("products.description")}</p>
          {/* ✅ نمایش آمار محصولات */}
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {t("products.showingProducts", {
                showing: filteredProducts.length,
                total: data.pages[0]?.totalResults || 0,
              })}
              {hasNextPage && (
                <span className="ml-2">
                  •{" "}
                  {t("products.pageInfo", {
                    current: data.pages.length,
                    total: data.pages[0]?.totalPages || 1,
                  })}
                </span>
              )}
            </p>
          )}
        </div>

        <Button onClick={handleOpenCreateForm}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("products.addProduct")}
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSetGridView}
            className={viewMode === "grid" ? "bg-muted" : ""}
            title={t("products.gridView")}
          >
            <LayoutGridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSetListView}
            className={viewMode === "list" ? "bg-muted" : ""}
            title={t("products.listView")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products list */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-6">
          {/* Products Grid */}
          <div
            className={`
             grid gap-6 
             ${
               viewMode === "grid"
                 ? "md:grid-cols-2 lg:grid-cols-3"
                 : "grid-cols-1"
             }
           `}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleOpenEditForm}
                onDelete={() => handleOpenDeleteDialog(product)}
              />
            ))}
          </div>

          {/* ✅ Infinite Scroll Loading */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex flex-col items-center py-8 space-y-4"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader size="md" />
                  <p className="text-sm text-muted-foreground">
                    {t("products.loadingMoreProducts")}
                  </p>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  className="gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  {t("products.loadMoreProducts")}
                </Button>
              )}
            </div>
          )}

          {/* ✅ End of results */}
          {!hasNextPage && allProducts.length > 4 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                🎉 {t("products.allProductsShown")}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
            <PackageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchTerm
              ? t("products.noProductsSearch")
              : t("products.noProducts")}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {searchTerm
              ? t("products.noProductsSearchDescription", { term: searchTerm })
              : t("products.noProductsDescription")}
          </p>
          <Button onClick={handleOpenCreateForm}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("products.addFirstProduct")}
          </Button>
        </div>
      )}

      {/* Modals and Dialogs */}

      {/* Create Product Form Modal */}
      {getValue("isCreateFormOpen") && (
        <ProductForm
          isOpen={getValue("isCreateFormOpen")}
          onClose={handleCloseCreateForm}
          onSubmit={handleCreateProduct}
          isLoading={isCreatingProduct}
        />
      )}

      {/* Edit Product Form Modal */}
      {getValue("isEditFormOpen") && selectedProduct && (
        <ProductForm
          product={selectedProduct}
          isOpen={getValue("isEditFormOpen")}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateProduct}
          isLoading={isUpdatingProduct}
        />
      )}

      {/* Delete Product Confirmation Dialog */}
      {getValue("isDeleteDialogOpen") && selectedProduct && (
        <DeleteProductDialog
          isOpen={getValue("isDeleteDialogOpen")}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteProduct}
          productName={selectedProduct.name}
          isLoading={isDeletingProduct}
        />
      )}
    </div>
  );
}
