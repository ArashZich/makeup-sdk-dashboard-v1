// src/features/admin/components/common/AdminDataTable.tsx
"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader } from "@/components/common/Loader";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface AdminDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pageCount?: number;
  pagination?: boolean;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder,
  isLoading = false,
  pageCount,
  pagination = true,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
}: AdminDataTableProps<TData, TValue>) {
  const { t, isRtl } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSorting = 
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      if (manualSorting && onSortingChange) {
        onSortingChange(newSorting);
      }
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = 
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      if (manualFiltering && onFilterChange) {
        onFilterChange(newFilters);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    pageCount: pageCount,
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  // این تابع برای مدیریت تغییرات صفحه‌بندی است
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    table.setPageIndex(pageIndex);
    table.setPageSize(pageSize);
    
    if (manualPagination && onPaginationChange) {
      onPaginationChange(pageIndex, pageSize);
    }
  };

  return (
    <div className="space-y-4">
      {searchColumn && (
        <div className="flex items-center relative">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder || t("common.search")}
            value={
              (columnFilters.find((f) => f.id === searchColumn)?.value as string) || ""
            }
            onChange={(e) => 
              table.getColumn(searchColumn)?.setFilterValue(e.target.value)
            }
            className="max-w-sm pl-9"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table dir={isRtl ? "rtl" : "ltr"}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={
                      header.column.getCanSort() 
                        ? "cursor-pointer select-none" 
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center">
                    <Loader size="md" text="common.loading" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {t("common.showing")} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            {t("common.of")} {table.getFilteredRowModel().rows.length}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                handlePaginationChange(0, Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPageIndex = table.getState().pagination.pageIndex - 1;
                handlePaginationChange(
                  newPageIndex,
                  table.getState().pagination.pageSize
                );
              }}
              disabled={!table.getCanPreviousPage()}
            >
              {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPageIndex = table.getState().pagination.pageIndex + 1;
                handlePaginationChange(
                  newPageIndex,
                  table.getState().pagination.pageSize
                );
              }}
              disabled={!table.getCanNextPage()}
            >
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}