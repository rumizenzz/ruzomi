import type { Metadata } from "next";

import { PasswordRecoveryScreen } from "@/components/password-recovery-screen";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Send a secure password reset link for your PayToCommit account.",
};

export default function ForgotPasswordPage() {
  return <PasswordRecoveryScreen />;
}
