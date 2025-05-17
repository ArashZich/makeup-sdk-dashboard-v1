// src/app/dashboard/sdk/new-token/page.tsx
import { Metadata } from "next";
import { NewTokenView } from "@/features/sdk/views/NewTokenView";

export const metadata: Metadata = {
  title: "Your SDK Token | Makeup SDK Dashboard",
  description: "Your new SDK token is ready to use",
};

export default function NewTokenPage() {
  return <NewTokenView />;
}
