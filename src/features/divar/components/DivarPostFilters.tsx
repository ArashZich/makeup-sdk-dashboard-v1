// src/features/divar/components/DivarPostFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";

interface DivarPostFiltersProps {
  onStatusChange: (status: "active" | "inactive" | "expired" | null) => void;
  onAddonFilterChange: (hasAddon: boolean | null) => void;
  onSearch: (term: string) => void;
}

export function DivarPostFilters({
  onStatusChange,
  onAddonFilterChange,
  onSearch,
}: DivarPostFiltersProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("all");
  const [selectedAddonTab, setSelectedAddonTab] = useState<string>("all");

  // Handle status tab change
  const handleStatusTabChange = (value: string) => {
    setSelectedStatusTab(value);

    if (value === "all") {
      onStatusChange(null);
    } else {
      onStatusChange(value as "active" | "inactive" | "expired");
    }
  };

  // Handle addon tab change
  const handleAddonTabChange = (value: string) => {
    setSelectedAddonTab(value);

    if (value === "all") {
      onAddonFilterChange(null);
    } else if (value === "withAddon") {
      onAddonFilterChange(true);
    } else {
      onAddonFilterChange(false);
    }
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("divar.filters.search")}
          value={searchTerm}
          onChange={handleSearchInput}
          className="pl-9 w-full"
        />
      </form>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Tabs
            defaultValue="all"
            value={selectedStatusTab}
            onValueChange={handleStatusTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">{t("divar.filters.all")}</TabsTrigger>
              <TabsTrigger value="active">
                {t("divar.filters.active")}
              </TabsTrigger>
              <TabsTrigger value="inactive">
                {t("divar.filters.inactive")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1">
          <Tabs
            defaultValue="all"
            value={selectedAddonTab}
            onValueChange={handleAddonTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">{t("divar.filters.all")}</TabsTrigger>
              <TabsTrigger value="withAddon">
                {t("divar.filters.withAddon")}
              </TabsTrigger>
              <TabsTrigger value="withoutAddon">
                {t("divar.filters.withoutAddon")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
