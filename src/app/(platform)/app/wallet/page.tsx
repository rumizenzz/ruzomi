import type { Metadata } from "next";

import { WalletDashboard } from "@/components/wallet-dashboard";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Review cash, payout timing, funding fees, Sovereign Spark fees, and wallet credits on PayToCommit.",
};

export default function WalletPage() {
  return <WalletDashboard />;
}
