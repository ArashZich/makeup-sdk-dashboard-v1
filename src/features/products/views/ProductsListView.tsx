// src/features/products/views/ProductsListView.tsx
"use client";

import { useState } from "react";
import { useProducts } from "@/api/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBoolean } from "@/hooks/useBoolean"; // ✅ اضافه کردن hook
import { Product } from "@/api/types/products.types";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showToast } from "@/lib/toast";
import logger from "@/lib/logger"; // ✅ اضافه کردن logger
import {
  InfoIcon,
  PlusIcon,
  Search,
  LayoutGridIcon,
  TableIcon,
  PackageIcon,
} from "lucide-react";

export function ProductsListView() {
  const { t } = useLanguage();

  // ✅ استفاده از useBoolean به جای state های جداگانه
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

  // Get products data
  const { data: products, isLoading, error, refetch } = getUserProducts();

  // Filter products by search term
  const filteredProducts = products
    ? products.results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // ✅ Create form handlers
  const handleOpenCreateForm = () => {
    logger.api("Opening create product form");
    setSelectedProduct(null); // پاک کردن محصول انتخاب شده
    setTrue("isCreateFormOpen");
  };

  const handleCloseCreateForm = () => {
    logger.api("Closing create product form");
    setFalse("isCreateFormOpen");
    setSelectedProduct(null);
  };

  // ✅ Edit form handlers
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

  // ✅ Delete dialog handlers
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

  // ✅ CRUD operations
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

  // ✅ View mode handlers
  const handleSetGridView = () => {
    logger.api("Switching to grid view");
    setViewMode("grid");
  };

  const handleSetListView = () => {
    logger.api("Switching to list view");
    setViewMode("list");
  };

  // ✅ Search handler
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

  // Error state
  if (error) {
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
        <div
          className={`
         grid gap-6 
         ${
           viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
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

      {/* ✅ Modals و Dialogs با استفاده از useBoolean */}

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
