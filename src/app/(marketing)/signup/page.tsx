import type { Metadata } from "next";

import { AuthEntry } from "@/components/auth-entry";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a PayToCommit account and continue into wallet funding, market entry, and proof tracking.",
};

export default function SignupPage() {
  return <AuthEntry mode="signup" />;
}
