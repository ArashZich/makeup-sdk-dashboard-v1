// src/app/dashboard/admin/users/page.tsx
import { Metadata } from "next";
import { UsersView } from "@/features/admin/users/views/UsersView";

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users in the admin dashboard",
};

export default function AdminUsersPage() {
  return <UsersView />;
}
