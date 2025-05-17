import { Metadata } from "next";
import { PaymentsListView } from "@/features/payments/views/PaymentsListView";

export const metadata: Metadata = {
  title: "Payments | Makeup SDK Dashboard",
  description: "Manage and view your payment history",
};

export default function PaymentsPage() {
  return <PaymentsListView />;
}
