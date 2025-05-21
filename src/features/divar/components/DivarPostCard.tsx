// src/features/divar/components/DivarPostCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { DivarPost } from "@/api/types/divar.types";
// import { formatCurrency, formatDate } from "@/lib/utils"; // حذف شد چون فیلدهای مربوطه در تایپ نیستند
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
  Tag,
  // MapPin, // حذف شد
  ImageIcon, // آیکون پیش‌فرض برای زمانی که عکس نیست
  // Calendar, // حذف شد
} from "lucide-react";

interface DivarPostCardProps {
  post: DivarPost;
  selectedProductId: string | null;
  onAddAddon: (postToken: string) => void;
  onRemoveAddon: (postToken: string) => void;
  isAddingAddonForToken: string | null;
  isRemovingAddonForToken: string | null;
}

export function DivarPostCard({
  post,
  selectedProductId,
  onAddAddon,
  onRemoveAddon,
  isAddingAddonForToken,
  isRemovingAddonForToken,
}: DivarPostCardProps) {
  const { t } = useLanguage(); // isRtl و formatCurrency و formatDate حذف شدند

  const handleAddAddonClick = () => {
    onAddAddon(post.token);
  };

  const handleRemoveAddonClick = () => {
    onRemoveAddon(post.token);
  };

  const openInDivar = () => {
    window.open(`https://divar.ir/v/${post.token}`, "_blank");
  };

  const isCurrentlyAdding = isAddingAddonForToken === post.token;
  const isCurrentlyRemoving = isRemovingAddonForToken === post.token;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground opacity-30" />
        {/* نمایش وضعیت آگهی حذف شد چون 'status' در DivarPost تعریف نشده است */}
        {/*
        <div className="absolute top-2 right-2">
          <Badge variant={getStatusBadgeVariant()}>
            {t(`divar.status.${post.status}`)}
          </Badge>
        </div>
        */}
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
        {/* نمایش شهر و منطقه حذف شد چون 'city' و 'district' در DivarPost تعریف نشده‌اند */}
        {/*
        {(post.city || post.district) && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {[post.city, post.district].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        */}

        {/* نمایش قیمت حذف شد چون 'price' در DivarPost تعریف نشده است */}
        {/*
        {formattedPrice && <div className="font-medium">{formattedPrice}</div>}
        */}

        {/* نمایش تاریخ ایجاد حذف شد چون 'createdAt' در DivarPost تعریف نشده است */}
        {/*
        <div className="text-xs text-muted-foreground">
          {formatDate(post.createdAt, isRtl ? "fa-IR" : "en-US")}
        </div>
        */}

        {/* Placeholder برای حفظ فضا اگر محتوای دیگری برای نمایش نیست */}
        {!post.category && (
          <div className="text-xs text-muted-foreground h-4"></div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
        {post.hasMakeupVirtualTryOn ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAddonClick}
            className="w-full"
            disabled={isCurrentlyRemoving}
          >
            <MinusSquare className="h-4 w-4 mr-2" />
            {isCurrentlyRemoving ? t("common.loading") : t("divar.removeAddon")}
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleAddAddonClick}
            className="w-full"
            disabled={!selectedProductId || isCurrentlyAdding}
          >
            <PlusSquare className="h-4 w-4 mr-2" />
            {isCurrentlyAdding ? t("common.loading") : t("divar.addAddon")}
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
