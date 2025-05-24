"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/common/DataTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/lib/date";
import { Product } from "@/api/types/products.types";
import { User } from "@/api/types/users.types";
import { Eye, Edit, Trash2, MoreHorizontal, Copy, Image } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  isDeletingProduct: boolean;
}

export function ProductTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  isDeletingProduct,
}: ProductTableProps) {
  const { t } = useLanguage();
  const { copyToClipboard } = useClipboard();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "lips":
        return "default";
      case "eyeshadow":
        return "secondary";
      case "eyepencil":
        return "outline";
      case "eyelashes":
        return "destructive";
      case "blush":
        return "default";
      case "eyeliner":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusVariant = (active: boolean) => {
    return active ? "default" : "secondary";
  };

  const handleCopyUid = (uid: string) => {
    copyToClipboard(uid);
  };

  const handleCopyCode = (code: string) => {
    copyToClipboard(code);
  };

  const getUserInfo = (product: Product) => {
    if (typeof product.userId === "string") {
      return { name: product.userId, phone: "" };
    }
    const user = product.userId as User;
    return {
      name: user.name,
      phone: user.phone,
    };
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDelete(productToDelete);
      setProductToDelete(null);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "thumbnail",
      header: () => t("admin.products.details.thumbnail"),
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {row.original.thumbnail ? (
            <img
              src={row.original.thumbnail}
              alt={row.original.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <Image className="h-6 w-6 text-muted-foreground" />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: () => t("admin.products.table.name"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: () => t("admin.products.table.user"),
      cell: ({ row }) => {
        const userInfo = getUserInfo(row.original);
        return (
          <div>
            <div className="font-medium text-sm">{userInfo.name}</div>
            {userInfo.phone && (
              <div className="text-xs text-muted-foreground">
                {userInfo.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => t("admin.products.table.type"),
      cell: ({ row }) => (
        <Badge variant={getTypeVariant(row.original.type)}>
          {t(`admin.products.types.${row.original.type}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "code",
      header: () => t("admin.products.table.code"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{row.original.code}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleCopyCode(row.original.code)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "uid",
      header: () => t("admin.products.table.uid"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
            {row.original.uid}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleCopyUid(row.original.uid)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: () => t("admin.products.table.status"),
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.active)}>
          {row.original.active
            ? t("admin.products.status.active")
            : t("admin.products.status.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "patterns",
      header: () => t("admin.products.table.patterns"),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-sm font-medium">
            {row.original.patterns.length}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "colors",
      header: () => t("admin.products.table.colors"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium mr-2">
            {row.original.colors.length}
          </span>
          <div className="flex gap-1">
            {row.original.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
            {row.original.colors.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => t("admin.products.table.createdAt"),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => t("admin.products.table.actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t("common.openMenu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedProduct(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setProductToDelete(row.original._id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder={t("admin.products.searchPlaceholder")}
        noResultsText={t("admin.products.noProducts")}
        pagination={true}
        pageSize={10}
      />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.products.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.products.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingProduct ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
