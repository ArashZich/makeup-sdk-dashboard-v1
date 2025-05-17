// src/app/dashboard/plans/page.tsx
import { Metadata } from "next";
import { PlansListView } from "@/features/plans/views/PlansListView";

export const metadata: Metadata = {
  title: "Plans | Makeup SDK Dashboard",
  description: "View and purchase plans for your Makeup SDK",
};

export default function PlansPage() {
  return <PlansListView />;
}
