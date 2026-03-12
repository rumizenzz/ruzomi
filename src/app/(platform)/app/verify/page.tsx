import type { Metadata } from "next";

import { IdentityVerifyScreen } from "@/components/identity-verify-screen";

export const metadata: Metadata = {
  title: "Verify Identity",
  description: "Verify your identity before funding wallet cash on PayToCommit.",
};

export default function VerifyPage() {
  return <IdentityVerifyScreen />;
}
