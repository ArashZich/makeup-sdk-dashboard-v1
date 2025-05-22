// src/features/divar/components/ProductSelectorCard.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/api/types/products.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Check,
  ShoppingBag,
  ChevronDown,
  SwatchBookIcon,
} from "lucide-react";
import Image from "next/image";

interface ProductSelectorCardProps {
  products: Product[];
  selectedProductId: string | null;
  onProductSelect: (productId: string) => void;
  isLoading?: boolean;
}

export function ProductSelectorCard({
  products,
  selectedProductId,
  onProductSelect,
  isLoading = false,
}: ProductSelectorCardProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // فیلتر محصولات بر اساس جستجو
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(`products.types.${product.type}`)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (productId: string) => {
    onProductSelect(productId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("divar.selectProduct")}</CardTitle>
        <CardDescription className="text-sm">
          {t("divar.selectProductDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-auto p-3"
              disabled={isLoading}
            >
              {selectedProduct ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    {selectedProduct.thumbnail ? (
                      <Image
                        src={selectedProduct.thumbnail}
                        alt={selectedProduct.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <SwatchBookIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {selectedProduct.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {t(`products.types.${selectedProduct.type}`)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  {t("divar.selectProduct")}
                </div>
              )}
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{t("divar.selectProduct")}</DialogTitle>
              <DialogDescription>
                {t("divar.selectProductDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* جستجو */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("products.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* لیست محصولات */}
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <Card
                        key={product._id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProductId === product._id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleProductSelect(product._id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                              {product.thumbnail ? (
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <SwatchBookIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {t(`products.types.${product.type}`)}
                                  </p>
                                </div>
                                {selectedProductId === product._id && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {product.colors.length}{" "}
                                  {t("products.form.colorsCount")}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {product.patterns.length}{" "}
                                  {t("products.form.patternsCount")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t("products.noProductsSearch")}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* آمار */}
              <div className="text-xs text-muted-foreground text-center border-t pt-2">
                {filteredProducts.length} از {products.length} محصول
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
