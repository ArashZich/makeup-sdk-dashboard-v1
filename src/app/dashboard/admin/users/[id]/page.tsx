// src/app/dashboard/admin/users/[id]/page.tsx
import { Metadata } from "next";
import { UserDetailsView } from "@/features/admin/users/views/UserDetailsView";

export const metadata: Metadata = {
  title: "User Details | Admin Dashboard",
  description: "View user details in the admin dashboard",
};

export default function UserDetailsPage() {
  return <UserDetailsView />;
}
