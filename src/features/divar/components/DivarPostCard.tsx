// src/features/divar/components/DivarPostCard.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DivarPost } from "@/api/types/divar.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  PlusSquare,
  MinusSquare,
  Image as ImageIcon,
  Tag,
  MapPin,
} from "lucide-react";
import Image from "next/image";

interface DivarPostCardProps {
  post: DivarPost;
  selectedProductId: string | null;
  onAddAddon: (postToken: string) => void;
  onRemoveAddon: (postToken: string) => void;
  isAddingAddon: boolean;
  isRemovingAddon: boolean;
}

export function DivarPostCard({
  post,
  selectedProductId,
  onAddAddon,
  onRemoveAddon,
  isAddingAddon,
  isRemovingAddon,
}: DivarPostCardProps) {
  const { t, isRtl } = useLanguage();

  // Format price if available
  const formattedPrice = post.price
    ? formatCurrency(
        post.price,
        isRtl ? "fa-IR" : "en-US",
        isRtl ? "IRR" : "USD"
      )
    : null;

  // Get status badge variant
  const getStatusBadgeVariant = () => {
    switch (post.status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Handle add addon click
  const handleAddAddon = () => {
    onAddAddon(post.token);
  };

  // Handle remove addon click
  const handleRemoveAddon = () => {
    onRemoveAddon(post.token);
  };

  // Open post in Divar
  const openInDivar = () => {
    window.open(`https://divar.ir/v/${post.token}`, "_blank");
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video w-full">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge variant={getStatusBadgeVariant()}>
            {t(`divar.status.${post.status}`)}
          </Badge>
        </div>

        {post.hasMakeupVirtualTryOn && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="primary" className="bg-primary/80 backdrop-blur-sm">
              {t("divar.tryOnAddon")}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
        {post.category && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>{post.category}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-2 flex-grow">
        {(post.city || post.district) && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {[post.city, post.district].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {formattedPrice && <div className="font-medium">{formattedPrice}</div>}

        <div className="text-xs text-muted-foreground">
          {formatDate(post.createdAt, isRtl ? "fa-IR" : "en-US")}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
        {post.hasMakeupVirtualTryOn ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAddon}
            className="w-full"
            disabled={isRemovingAddon}
          >
            <MinusSquare className="h-4 w-4 mr-2" />
            {t("divar.removeAddon")}
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleAddAddon}
            className="w-full"
            disabled={!selectedProductId || isAddingAddon}
          >
            <PlusSquare className="h-4 w-4 mr-2" />
            {t("divar.addAddon")}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={openInDivar}
          className="w-full flex-none"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t("divar.viewOnDivar")}
        </Button>
      </CardFooter>
    </Card>
  );
}
