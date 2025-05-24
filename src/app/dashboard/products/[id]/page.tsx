// src/app/dashboard/products/[id]/page.tsx
import { Metadata } from "next";
import { ProductDetailsView } from "@/features/products/views/ProductDetailsView";

export const metadata: Metadata = {
  title: "Product Details | Makeup SDK Dashboard",
  description: "View and manage product details",
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>; // تغییر: Promise اضافه شد
}) {
  const { id } = await params; // تغییر: await اضافه شد
  return <ProductDetailsView productId={id} />;
}
