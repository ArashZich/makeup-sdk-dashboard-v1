// src/app/dashboard/packages/[id]/page.tsx
import { Metadata } from "next";
import { PackageDetailsView } from "@/features/packages/views/PackageDetailsView";

export const metadata: Metadata = {
  title: "Package Details | Makeup SDK Dashboard",
  description: "View package details for your Makeup SDK",
};

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PackageDetailsView packageId={id} />;
}
