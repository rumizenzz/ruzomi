import type { Metadata } from "next";

import { AutonomousProofConsole } from "@/components/autonomous-proof-console";
import { GlassPanel, LedgerTable, SectionIntro } from "@/components/surfaces";
import { listNetworkLedger } from "@/lib/paytocommit-data";

export const metadata: Metadata = {
  title: "History",
  description: "Run AI proof verification, rerun appeals, and review recorded closes on PayToCommit.",
};

export default async function HistoryPage() {
  const ledgerEntries = await listNetworkLedger();

  return (
    <>
      <SectionIntro
        eyebrow="History"
        title="Proof, appeals, payouts, and downloadable closes."
        body="Run autonomous verification, rerun appeals, and track every market close through the Commitment Network."
      />
      <AutonomousProofConsole />
      <GlassPanel>
        <LedgerTable entries={ledgerEntries} />
      </GlassPanel>
    </>
  );
}
