"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentStatus } from "@/api/types/payments.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";

interface PaymentFiltersProps {
  onStatusChange: (status: PaymentStatus | null) => void;
  onSearch: (term: string) => void;
}

export function PaymentFilters({
  onStatusChange,
  onSearch,
}: PaymentFiltersProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    onStatusChange(value === "all" ? null : (value as PaymentStatus));
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 min-w-[240px]"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={handleSearchInput}
            className="pl-9 max-w-md"
          />
        </form>
        <div className="flex items-center gap-2">
          <Select defaultValue="date_desc">
            <SelectTrigger className="bg-background w-auto min-w-[150px]">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder={t("payments.sortByDate")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">
                {t("common.date")} ({t("common.newest")})
              </SelectItem>
              <SelectItem value="date_asc">
                {t("common.date")} ({t("common.oldest")})
              </SelectItem>
              <SelectItem value="amount_desc">
                {t("payments.amount")} ({t("common.highest")})
              </SelectItem>
              <SelectItem value="amount_asc">
                {t("payments.amount")} ({t("common.lowest")})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="all">{t("payments.tabs.all")}</TabsTrigger>
          <TabsTrigger value="pending">
            {t("payments.tabs.pending")}
          </TabsTrigger>
          <TabsTrigger value="success">
            {t("payments.tabs.success")}
          </TabsTrigger>
          <TabsTrigger value="failed">{t("payments.tabs.failed")}</TabsTrigger>
          <TabsTrigger value="canceled">
            {t("payments.tabs.canceled")}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
