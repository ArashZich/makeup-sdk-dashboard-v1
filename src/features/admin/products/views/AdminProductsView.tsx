"use client";

import { useState, useMemo } from "react";
import { useAdminProducts } from "@/api/hooks/useProducts";
import { useAdminUsers } from "@/api/hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, ArrowLeft, Users, Search } from "lucide-react";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import { Product } from "@/api/types/products.types";

type ProductType =
  | "lips"
  | "eyeshadow"
  | "eyepencil"
  | "eyelashes"
  | "blush"
  | "eyeliner";

export function AdminProductsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [filters, setFilters] = useState<{
    type?: ProductType;
    active?: boolean;
  }>({});

  // Hooks
  const {
    getUserProducts,
    createProductForUser,
    updateUserProduct,
    deleteUserProduct,
    isCreatingProductForUser,
    isUpdatingUserProduct,
    isDeletingUserProduct,
  } = useAdminProducts();

  const { getUsers } = useAdminUsers();

  // دریافت همه کاربران
  const { data: usersData, isLoading: isLoadingUsers } = getUsers({
    limit: 1000,
  });

  const users = usersData?.results || [];

  // 🔧 اصلاح: استفاده از hook به جای function
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = getUserProducts(
    selectedUserId || "dummy",
    {},
    {
      enabled: Boolean(selectedUserId), // فقط وقتی کاربر انتخاب شده فعال باشه
    }
  );

  const allProducts = productsData?.results || [];

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (filters.type) {
      filtered = filtered.filter((product) => product.type === filters.type);
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(
        (product) => product.active === filters.active
      );
    }

    return filtered;
  }, [allProducts, filters]);

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleFetchProducts = () => {
    if (selectedUserId) {
      refetchProducts();
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setActiveTab("form");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("form");
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      if (!selectedUserId) return;

      await deleteUserProduct({ userId: selectedUserId, productId });

      // Refresh products after delete
      refetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        // Update existing product
        await updateUserProduct({
          userId: selectedUserId,
          productId: editingProduct._id,
          data: {
            name: data.name,
            description: data.description,
            thumbnail: data.thumbnail,
            patterns: data.patterns,
            colors: data.colors,
            active: data.active,
          },
        });
      } else {
        // Create new product
        await createProductForUser({
          userId: data.userId,
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            code: data.code,
            thumbnail: data.thumbnail,
            patterns: data.patterns,
            colors: data.colors,
            active: data.active,
          },
        });
      }

      // Refresh products after create/update
      if (selectedUserId) {
        refetchProducts();
      }

      setActiveTab("overview");
      setEditingProduct(null);
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  const handleFormCancel = () => {
    setActiveTab("overview");
    setEditingProduct(null);
  };

  const handleBackToOverview = () => {
    setActiveTab("overview");
    setEditingProduct(null);
  };

  const selectedUser = users.find((u) => u._id === selectedUserId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.products.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.products.description")}
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
          <TabsTrigger value="form">
            {editingProduct
              ? t("admin.products.editProduct")
              : t("admin.products.createProduct")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("admin.products.filters.filterByUser")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Select
                    value={selectedUserId}
                    onValueChange={handleUserChange}
                    disabled={isLoadingUsers}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingUsers
                            ? t("common.loading")
                            : t("admin.products.form.userSelectPlaceholder")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleFetchProducts}
                  disabled={!selectedUserId || isLoadingProducts}
                  className="shrink-0"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isLoadingProducts
                    ? t("common.loading")
                    : t("admin.products.fetchProducts")}
                </Button>
              </div>

              {selectedUser && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">
                      {t("admin.products.selectedUser")}:
                    </span>{" "}
                    {selectedUser.name} ({selectedUser.phone})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards - فقط اگر کاربری انتخاب شده */}
          {selectedUserId && allProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("admin.products.allProducts")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredProducts.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("common.total")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("admin.products.status.active")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredProducts.filter((p) => p.active).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.products.status.active")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("admin.products.status.inactive")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredProducts.filter((p) => !p.active).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.products.status.inactive")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("admin.products.types.eyeshadow")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      filteredProducts.filter((p) => p.type === "eyeshadow")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.products.types.eyeshadow")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters - فقط اگر محصولی وجود داشته باشد */}
          {allProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("common.filters")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("admin.products.filters.filterByType")}
                    </label>
                    <Select
                      value={filters.type || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          type:
                            value === "all"
                              ? undefined
                              : (value as ProductType),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.products.filters.allTypes")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("admin.products.filters.allTypes")}
                        </SelectItem>
                        <SelectItem value="lips">
                          {t("admin.products.types.lips")}
                        </SelectItem>
                        <SelectItem value="eyeshadow">
                          {t("admin.products.types.eyeshadow")}
                        </SelectItem>
                        <SelectItem value="eyepencil">
                          {t("admin.products.types.eyepencil")}
                        </SelectItem>
                        <SelectItem value="eyelashes">
                          {t("admin.products.types.eyelashes")}
                        </SelectItem>
                        <SelectItem value="blush">
                          {t("admin.products.types.blush")}
                        </SelectItem>
                        <SelectItem value="eyeliner">
                          {t("admin.products.types.eyeliner")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("admin.products.filters.filterByStatus")}
                    </label>
                    <Select
                      value={
                        filters.active === undefined
                          ? "all"
                          : filters.active
                          ? "active"
                          : "inactive"
                      }
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          active:
                            value === "all" ? undefined : value === "active",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("admin.products.filters.allStatuses")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("admin.products.filters.allStatuses")}
                        </SelectItem>
                        <SelectItem value="active">
                          {t("admin.products.status.active")}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t("admin.products.status.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedUserId
                    ? t("admin.products.userProducts")
                    : t("admin.products.allProducts")}
                </CardTitle>
                <Button onClick={handleCreateProduct} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("admin.products.createProduct")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedUserId ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("admin.products.selectUserFirst")}
                  </p>
                </div>
              ) : isLoadingProducts ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("common.loading")}...
                  </p>
                </div>
              ) : productsError ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">
                    {t("common.error.general")}
                  </p>
                  <Button
                    onClick={handleFetchProducts}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("common.refresh")}
                  </Button>
                </div>
              ) : allProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t("admin.products.noProducts")}
                  </p>
                </div>
              ) : (
                <ProductTable
                  products={filteredProducts}
                  isLoading={isLoadingProducts}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  isDeletingProduct={isDeletingUserProduct}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Tab */}
        <TabsContent value="form" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={handleBackToOverview} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <div>
              <h2 className="text-xl font-semibold">
                {editingProduct
                  ? t("admin.products.editProduct")
                  : t("admin.products.createProduct")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.products.form.title")}
              </p>
            </div>
          </div>

          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isCreatingProductForUser || isUpdatingUserProduct}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
