// src/features/admin/components/users/UserFilters.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface UserFiltersProps {
  onFilter: (filters: any) => void;
}

export function UserFilters({ onFilter }: UserFiltersProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("");

  const handleFilter = () => {
    const filters: any = {};
    if (name) filters.name = name;
    if (phone) filters.phone = phone;
    if (role) filters.role = role;

    onFilter(filters);
  };

  const handleClear = () => {
    setName("");
    setPhone("");
    setRole("");
    onFilter({});
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t("common.filter")}
          </Button>
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              {t("common.clear")}
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("common.name")}
                </label>
                <Input
                  placeholder={t("common.searchByName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("common.phone")}
                </label>
                <Input
                  placeholder={t("common.searchByPhone")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("profile.role")}
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("common.all")}</SelectItem>
                    <SelectItem value="admin">
                      {t("profile.roles.admin")}
                    </SelectItem>
                    <SelectItem value="user">
                      {t("profile.roles.user")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleFilter}>{t("common.applyFilters")}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
