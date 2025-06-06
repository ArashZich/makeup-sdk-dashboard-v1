// src/features/divar/components/DivarSimpleSearch.tsx
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DivarSimpleSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export function DivarSimpleSearch({
  searchTerm,
  onSearchChange,
  placeholder,
}: DivarSimpleSearchProps) {
  const { t } = useLanguage();

  const defaultPlaceholder = placeholder || t("divar.filters.search");

  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="relative flex-1 w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={defaultPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
