// src/app/dashboard/plans/[id]/page.tsx
import { Metadata } from "next";
import { PlanDetailsView } from "@/features/plans/views/PlanDetailsView";

export const metadata: Metadata = {
  title: "Plan Details | Makeup SDK Dashboard",
  description: "View and purchase plan details for your Makeup SDK",
};

export default async function PlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // تغییر: await اضافه شد

  return <PlanDetailsView planId={id} />;
}
