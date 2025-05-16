// src/app/auth/layout.tsx
import { AuthLayout } from "@/layouts/AuthLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Makeup SDK Dashboard",
  description: "Login to the Makeup SDK Management System",
};

export default function AuthAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
