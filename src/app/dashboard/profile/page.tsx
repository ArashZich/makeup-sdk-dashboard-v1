// src/app/dashboard/products/page.tsx
import { Metadata } from "next";
import { ProfileView } from "@/features/profile/views/ProfileView";

export const metadata: Metadata = {
  title: "Profile | Makeup SDK Dashboard",
  description: "Manage your Makeup SDK profile",
};

export default function ProfilePage() {
  return <ProfileView />;
}
