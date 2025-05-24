"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { Product } from "@/api/types/products.types";
import { User } from "@/api/types/users.types";
import { Copy, Package, User as UserIcon, Palette, Image, Eye } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  const { t } = useLanguage();
  const { copyToClipboard } = useClipboard();

  if (!product) return null;

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "lips": return "default";
      case "eyeshadow": return "secondary";
      case "eyepencil": return "outline";
      case "eyelashes": return "destructive";
      case "blush": return "default";
      case "eyeliner": return "secondary";
      default: return "outline";
    }
  };

  const getStatusVariant = (active: boolean) => {
    return active ? "default" : "secondary";
  };

  const userInfo = typeof product.userId === 'string' 
    ? { name: product.userId, phone: "", email: "" }
    : product.userId as User;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("admin.products.details.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.products.table.name")}
              </label>
              <p className="mt-1 font-semibold">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.products.table.type")}
              </label>
              <div className="mt-1">
                <Badge variant={getTypeVariant(product.type)}>
                  {t(`admin.products.types.${product.type}`)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.products.details.productCode")}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm">{product.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(product.code)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.products.details.productUid")}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {product.uid}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(product.uid)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("admin.products.table.status")}
              </label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(product.active)}>
                  {product.active 
                    ? t("admin.products.status.active")
                    : t("admin.products.status.inactive")
                  }
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("admin.products.details.description")}
            </label>
            <div className="mt-1 p-3 bg-muted/50 rounded-md">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          <Separator />

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="h-4 w-4" />
              <h3 className="font-medium">{t("admin.products.details.userInfo")}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.users.form.nameLabel")}
                </label>
                <p className="mt-1">{userInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.users.form.phoneLabel")}
                </label>
                <p className="mt-1">{userInfo.phone || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thumbnail */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-4 w-4" />
              <h3 className="font-medium">{t("admin.products.details.thumbnail")}</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {product.thumbnail ? (
                  <img 
                    src={product.thumbnail} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono break-all">{product.thumbnail}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => copyToClipboard(product.thumbnail)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {product.thumbnail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => window.open(product.thumbnail, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Patterns */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">
                {t("admin.products.details.patternsInfo")} ({product.patterns.length})
              </h3>
            </div>
            {product.patterns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.patterns.map((pattern, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {pattern.imageUrl ? (
                          <img 
                            src={pattern.imageUrl} 
                            alt={pattern.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{pattern.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {pattern.code}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(pattern.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {pattern.imageUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(pattern.imageUrl, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t("admin.products.details.noPatterns")}
              </p>
            )}
          </div>

          <Separator />

          {/* Colors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
              <h3 className="font-medium">
                {t("admin.products.details.colorsInfo")} ({product.colors.length})
              </h3>
            </div>
            {product.colors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.colors.map((color, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {color.imageUrl ? (
                          <img 
                            src={color.imageUrl} 
                            alt={color.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{color.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {color.hexCode}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(color.hexCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {color.imageUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(color.imageUrl, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t("admin.products.details.noColors")}
              </p>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="font-medium mb-3">{t("admin.products.details.dates")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.products.details.createdAt")}
                </label>
                <p className="mt-1">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("admin.products.details.updatedAt")}
                </label>
                <p className="mt-1">{formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}