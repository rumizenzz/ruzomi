import type { Metadata } from "next";

import { AuthEntry } from "@/components/auth-entry";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to PayToCommit to open My Portfolio, review wallet cash, and manage active markets.",
};

export default function LoginPage() {
  return <AuthEntry mode="login" />;
}
