// src/app/dashboard/products/[id]/page.tsx
import { Metadata } from "next";
import { ProductDetailsView } from "@/features/products/views/ProductDetailsView";

export const metadata: Metadata = {
  title: "Product Details | Makeup SDK Dashboard",
  description: "View and manage product details",
};

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProductDetailsView productId={params.id} />;
}
