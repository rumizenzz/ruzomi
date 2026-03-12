import type { Metadata } from "next";

import { GlassPanel } from "@/components/surfaces";
import { getFeeSchedule } from "@/lib/paytocommit-data";

export const metadata: Metadata = {
  title: "Fees",
  description:
    "Review PayToCommit funding fees, Sovereign Spark infrastructure fees, settlement capture, payout rules, and invite reward release conditions.",
};

export default function FeesPage() {
  const feeSchedule = getFeeSchedule();

  return (
    <section className="section-stack">
      <div className="section-stack">
        <span className="eyebrow">Fees</span>
        <h1 className="section-title">Funding, tickets, Chains, and payouts</h1>
        <p className="section-copy">
          PayToCommit runs on wallet funding fees, Sovereign Spark infrastructure fees, and settlement capture from the forfeited side.
        </p>
      </div>

      <section className="split-grid">
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Fee schedule</h2>
            <div className="timeline-list">
              {feeSchedule.items.map((item, index) => (
                <div key={item.label} className="timeline-item">
                  <div className="timeline-index">{index + 1}</div>
                  <div className="section-stack">
                    <strong>
                      {item.label} · {item.value}
                    </strong>
                    <p className="detail-text">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Payout rules</h2>
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Completed side</span>
                <strong>{feeSchedule.payoutRule}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Settlement capture</span>
                <strong>{feeSchedule.settlementCapture}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">If nobody completes</span>
                <strong>{feeSchedule.zeroCompleteCapture}</strong>
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      <GlassPanel>
        <div className="section-stack">
          <h2 className="section-title">Invite reward release</h2>
          <p className="section-copy">
            Both sides unlock $10 in wallet cash after the invited account closes 3 successful stakes and the referral cycle generated enough fees to cover the reward.
          </p>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-index">1</div>
              <div className="section-stack">
                <strong>Invite accepted</strong>
                <p className="detail-text">A new account joins through a valid PayToCommit invite.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">2</div>
              <div className="section-stack">
                <strong>3 successful stakes</strong>
                <p className="detail-text">The invited account finishes three stakes that resolve completed.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">3</div>
              <div className="section-stack">
                <strong>Fee coverage closes</strong>
                <p className="detail-text">The reward releases only after the funding, infrastructure, and settlement fees from that cycle cover the reward liability.</p>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}
