// src/app/dashboard/payments/[id]/page.tsx
import { Metadata } from "next";
import { PaymentDetailsView } from "@/features/payments/views/PaymentDetailsView";

export const metadata: Metadata = {
  title: "Payment Details | Makeup SDK Dashboard",
  description: "View detailed information about your payment",
};

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>; // تغییر: Promise اضافه شد
}) {
  const { id } = await params; // تغییر: await اضافه شد

  return <PaymentDetailsView paymentId={id} />;
}
