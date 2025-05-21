// src/app/dashboard/divar/page.tsx
import { Metadata } from "next";
import { DivarIntegrationView } from "@/features/divar/views/DivarIntegrationView";

export const metadata: Metadata = {
  title: "Divar Integration | Makeup SDK Dashboard",
  description: "Add your products to your Divar listings",
};

export default function DivarIntegrationPage() {
  return <DivarIntegrationView />;
}
