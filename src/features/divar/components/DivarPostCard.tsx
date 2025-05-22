// src/features/divar/components/DivarPostCard.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { DivarPost } from "@/api/types/divar.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, PlusSquare, MinusSquare, Tag } from "lucide-react";

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
  const { t } = useLanguage();

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
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 leading-tight">
              {post.title}
            </h3>
            {post.category && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Tag className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{post.category}</span>
              </div>
            )}
          </div>
          {post.hasMakeupVirtualTryOn && (
            <Badge variant="default" className="flex-shrink-0 text-xs">
              {t("divar.tryOnAddon")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-grow">
        <div className="space-y-2">
          {!post.category && (
            <div className="text-sm text-muted-foreground">
              {t("divar.postTitle")}: {post.title}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2">
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
          variant="ghost"
          size="sm"
          onClick={openInDivar}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t("divar.viewOnDivar")}
        </Button>
      </CardFooter>
    </Card>
  );
}
