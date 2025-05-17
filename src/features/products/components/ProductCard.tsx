// src/features/products/components/ProductCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Product } from "@/api/types/products.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenIcon,
  Trash2Icon,
  EyeIcon,
  SwatchBookIcon,
  PaletteIcon,
} from "lucide-react";
import Image from "next/image";

// Mapping for product types to display names
const productTypeLabels: Record<string, string> = {
  lips: "Lipstick",
  eyeshadow: "Eyeshadow",
  eyepencil: "Eye Pencil",
  eyelashes: "Eyelashes",
  blush: "Blush",
  eyeliner: "Eyeliner",
};

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/products/${product._id}`);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <SwatchBookIcon className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant={product.active ? "default" : "outline"}>
            {product.active ? t("products.active") : t("products.inactive")}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {t(`products.types.${product.type}`)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <PaletteIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("products.colors", { count: product.colors.length })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <SwatchBookIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("products.patterns", { count: product.patterns.length })}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(product)}
        >
          <PenIcon className="h-4 w-4 mr-1" />
          {t("common.edit")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleViewDetails}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          {t("common.view")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-none w-9 p-0"
          onClick={() => onDelete(product._id)}
        >
          <Trash2Icon className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
