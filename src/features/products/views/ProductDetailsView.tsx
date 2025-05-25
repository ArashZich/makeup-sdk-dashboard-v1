// src/features/products/views/ProductDetailsView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/api/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { ProductAnalytics } from "../components/ProductAnalytics";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { showToast } from "@/lib/toast";
import {
  InfoIcon,
  PenIcon,
  TrashIcon,
  SwatchBookIcon,
  PaletteIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import Image from "next/image";
import { useClipboard } from "@/hooks/useClipboard";
import { BackButtonIcon } from "@/components/common/BackButton";

interface ProductDetailsViewProps {
  productId: string;
}

export function ProductDetailsView({ productId }: ProductDetailsViewProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  // State
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // API hooks
  const {
    getProduct,
    updateProduct,
    deleteProduct,
    isUpdatingProduct,
    isDeletingProduct,
  } = useProducts();

  // Get product data
  const { data: product, isLoading, error, refetch } = getProduct(productId);

  // Clipboard hook for copying product ID/UID
  const { isCopied, copyToClipboard } = useClipboard({
    successMessage: t("products.idCopied"),
  });

  // Handle back
  const handleBack = () => {
    router.back();
  };

  // Open edit form
  const handleOpenEditForm = () => {
    setIsEditFormOpen(true);
  };

  // Close edit form
  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  // Handle update product
  const handleUpdateProduct = async (data: any) => {
    if (!product) return;

    try {
      await updateProduct({
        productId: product._id,
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
    if (!product) return;

    try {
      await deleteProduct(product._id);
      showToast.success(t("products.deleteSuccess"));
      router.push("/dashboard/products");
    } catch (error) {
      showToast.error(t("products.deleteError"));
    }
  };

  // Copy product ID/UID to clipboard
  const handleCopyId = () => {
    if (product) {
      copyToClipboard(product.uid);
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
  if (error || !product) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>{t("products.error.title")}</AlertTitle>
        <AlertDescription>
          {t("products.error.productNotFound")}
        </AlertDescription>
        <div className="mt-4">
          <BackButtonIcon onClick={handleBack} />
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BackButtonIcon onClick={handleBack} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="w-full md:w-1/3">
          <Card>
            <div className="relative aspect-square w-full">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <SwatchBookIcon className="h-20 w-20 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            <CardFooter className="justify-between p-4">
              <Button variant="outline" size="sm" onClick={handleOpenEditForm}>
                <PenIcon className="h-4 w-4 mr-2" />
                {t("common.edit")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDeleteDialog}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {t("common.delete")}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>
                    {t(`products.types.${product.type}`)}
                  </CardDescription>
                </div>
                <Badge variant={product.active ? "default" : "outline"}>
                  {product.active
                    ? t("products.active")
                    : t("products.inactive")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                defaultValue="info"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">
                    {t("products.tabs.info")}
                  </TabsTrigger>
                  <TabsTrigger value="patterns">
                    {t("products.tabs.patterns")}
                  </TabsTrigger>
                  <TabsTrigger value="colors">
                    {t("products.tabs.colors")}
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    {t("products.tabs.analytics")}
                  </TabsTrigger>
                </TabsList>

                {/* Product Info Tab */}
                <TabsContent value="info" className="mt-4 space-y-4">
                  {product.description && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        {t("products.description")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      {t("products.productId")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted p-1 rounded text-xs">
                        {product.uid}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopyId}
                      >
                        {isCopied ? (
                          <CheckIcon className="h-3 w-3 text-green-500" />
                        ) : (
                          <CopyIcon className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      {t("products.productCode")}
                    </h3>
                    <p className="text-sm">{product.code}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        {t("products.patternsCount")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <SwatchBookIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {product.patterns.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        {t("products.colorsCount")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <PaletteIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{product.colors.length}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Patterns Tab */}
                <TabsContent value="patterns" className="mt-4 space-y-4">
                  {product.patterns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.patterns.map((pattern, index) => (
                        <div
                          key={index}
                          className="border rounded-md overflow-hidden"
                        >
                          <div className="h-40 relative bg-muted">
                            {pattern.imageUrl ? (
                              <Image
                                src={pattern.imageUrl}
                                alt={pattern.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <SwatchBookIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium">{pattern.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {pattern.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SwatchBookIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-muted-foreground">
                        {t("products.noPatternsAvailable")}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Colors Tab */}
                <TabsContent value="colors" className="mt-4 space-y-4">
                  {product.colors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className="border rounded-md overflow-hidden"
                        >
                          <div
                            className="h-20"
                            style={{ backgroundColor: color.hexCode }}
                          ></div>
                          <div className="p-3">
                            <h4 className="font-medium">{color.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {color.hexCode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PaletteIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
                      <p className="text-muted-foreground">
                        {t("products.noColorsAvailable")}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="mt-4">
                  <ProductAnalytics product={product} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Product Form Modal */}
      {isEditFormOpen && (
        <ProductForm
          product={product}
          isOpen={isEditFormOpen}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateProduct}
          isLoading={isUpdatingProduct}
        />
      )}

      {/* Delete Product Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteProduct}
          productName={product.name}
          isLoading={isDeletingProduct}
        />
      )}
    </div>
  );
}
