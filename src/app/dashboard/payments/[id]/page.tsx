import { Metadata } from "next";
import { PaymentDetailsView } from "@/features/payments/views/PaymentDetailsView";

export const metadata: Metadata = {
  title: "Payment Details | Makeup SDK Dashboard",
  description: "View detailed information about your payment",
};

export default function PaymentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <PaymentDetailsView paymentId={params.id} />;
}
