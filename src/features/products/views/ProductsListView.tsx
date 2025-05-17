// src/features/products/views/ProductsListView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/api/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/api/types/products.types";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showToast } from "@/lib/toast";
import {
  InfoIcon,
  PlusIcon,
  Search,
  FilterIcon,
  LayoutGridIcon,
  TableIcon,
  PackageIcon,
} from "lucide-react";

export function ProductsListView() {
  const { t } = useLanguage();
  const router = useRouter();

  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Open create form
  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  // Close create form
  const handleCloseCreateForm = () => {
    setIsCreateFormOpen(false);
  };

  // Open edit form
  const handleOpenEditForm = (product: Product) => {
    setSelectedProduct(product);
    setIsEditFormOpen(true);
  };

  // Close edit form
  const handleCloseEditForm = () => {
    setSelectedProduct(null);
    setIsEditFormOpen(false);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  // Handle create product
  const handleCreateProduct = async (data: any) => {
    try {
      await createProduct(data);
      showToast.success(t("products.createSuccess"));
      refetch();
      handleCloseCreateForm();
    } catch (error) {
      showToast.error(t("products.createError"));
    }
  };

  // Handle update product
  const handleUpdateProduct = async (data: any) => {
    if (!selectedProduct) return;

    try {
      await updateProduct({
        productId: selectedProduct._id,
        data,
      });
      showToast.success(t("products.updateSuccess"));
      refetch();
      handleCloseEditForm();
    } catch (error) {
      showToast.error(t("products.updateError"));
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct._id);
      showToast.success(t("products.deleteSuccess"));
      refetch();
      handleCloseDeleteDialog();
      // src/features/products/views/ProductsListView.tsx (continued)
    } catch (error) {
      showToast.error(t("products.deleteError"));
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-muted" : ""}
          >
            <LayoutGridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-muted" : ""}
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

      {/* Create Product Form Modal */}
      {isCreateFormOpen && (
        <ProductForm
          isOpen={isCreateFormOpen}
          onClose={handleCloseCreateForm}
          onSubmit={handleCreateProduct}
          isLoading={isCreatingProduct}
        />
      )}

      {/* Edit Product Form Modal */}
      {isEditFormOpen && selectedProduct && (
        <ProductForm
          product={selectedProduct}
          isOpen={isEditFormOpen}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateProduct}
          isLoading={isUpdatingProduct}
        />
      )}

      {/* Delete Product Confirmation Dialog */}
      {isDeleteDialogOpen && selectedProduct && (
        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteProduct}
          productName={selectedProduct.name}
          isLoading={isDeletingProduct}
        />
      )}
    </div>
  );
}
