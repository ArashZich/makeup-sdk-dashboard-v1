// src/app/dashboard/products/page.tsx
import { Metadata } from "next";
import { ProductsListView } from "@/features/products/views/ProductsListView";

export const metadata: Metadata = {
  title: "Products | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK products",
};

export default function ProductsPage() {
  return <ProductsListView />;
}
