// src/app/dashboard/packages/[id]/page.tsx
import { Metadata } from "next";
import { PackageDetailsView } from "@/features/packages/views/PackageDetailsView";

export const metadata: Metadata = {
  title: "Package Details | Makeup SDK Dashboard",
  description: "View package details for your Makeup SDK",
};

export default function PackageDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <PackageDetailsView packageId={params.id} />;
}
