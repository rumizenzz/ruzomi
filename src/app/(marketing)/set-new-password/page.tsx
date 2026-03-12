import type { Metadata } from "next";

import { PasswordResetScreen } from "@/components/password-reset-screen";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Choose a new password for your PayToCommit account after opening your recovery link.",
};

export default function SetNewPasswordPage() {
  return <PasswordResetScreen />;
}
