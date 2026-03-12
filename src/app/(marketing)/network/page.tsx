import type { Metadata } from "next";

import { GlassPanel, LedgerTable, SectionIntro } from "@/components/surfaces";
import { listNetworkLedger } from "@/lib/paytocommit-data";

export const metadata: Metadata = {
  title: "Commitment Network",
  description:
    "Inspect the public ledger for stake placement, proof acceptance, fee capture, payout release, and reward issuance.",
};

export default async function NetworkPage() {
  const networkLedger = await listNetworkLedger();

  return (
    <>
      <SectionIntro
        eyebrow="Commitment Network"
        title="Stake, proof, fees, payouts, and rewards."
        body="Each entry records what moved, when it moved, and what state closed next."
      />
      <LedgerTable entries={networkLedger} />
      <GlassPanel>
        <div className="section-stack">
          <h2 className="section-title">Recorded entries</h2>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-index">1</div>
              <div className="section-stack">
                <strong>Stake and proof</strong>
                <p className="detail-text">Paid joins, proof packets, and challenge openings.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">2</div>
              <div className="section-stack">
                <strong>Fee capture</strong>
                <p className="detail-text">Funding fees, Sovereign Spark capture, and settlement capture.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">3</div>
              <div className="section-stack">
                <strong>Payout and rewards</strong>
                <p className="detail-text">Winner distribution, wallet credits, and invite reward release.</p>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
