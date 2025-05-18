// src/app/dashboard/payments/[id]/page.tsx
import { Metadata } from "next";
import { PaymentDetailsView } from "@/features/payments/views/PaymentDetailsView";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Payment Details | Makeup SDK Dashboard",
    description: "View detailed information about your payment",
  };
}

export default function PaymentDetailsPage({ params }: Props) {
  return <PaymentDetailsView paymentId={params.id} />;
}
