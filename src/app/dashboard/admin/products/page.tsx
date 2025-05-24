import { Metadata } from "next";
import { AdminProductsView } from "@/features/admin/products/views/AdminProductsView";

export const metadata: Metadata = {
  title: "Products Management | Admin Dashboard",
  description: "View and manage all user products and their details",
};

export default function AdminProductsPage() {
  return <AdminProductsView />;
}
