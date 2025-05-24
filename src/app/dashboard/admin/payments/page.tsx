import { Metadata } from "next";
import { AdminPaymentsView } from "@/features/admin/payments/views/AdminPaymentsView";

export const metadata: Metadata = {
  title: "Payments Management | Admin Dashboard",
  description: "View and manage all system payments and transactions",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsView />;
}
