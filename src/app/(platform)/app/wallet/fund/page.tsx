import type { Metadata } from "next";

import { DepositMethodScreen } from "@/components/deposit-method-screen";

export const metadata: Metadata = {
  title: "Deposit Methods",
  description: "Choose how wallet cash moves into PayToCommit before funding a new market.",
};

export default function WalletFundingMethodsPage() {
  return <DepositMethodScreen />;
}
