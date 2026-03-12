import type { Metadata } from "next";
import Link from "next/link";

import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { listChains } from "@/lib/paytocommit-data";

export const metadata: Metadata = {
  title: "Chains",
  description: "Two-leg linked commitment markets that only close clean when both commitments finish on time.",
};

export default async function ChainsPage() {
  const chains = await listChains();

  return (
    <section className="section-stack">
      <SectionIntro
        eyebrow="Chains"
        title="Two linked closes, one funded position."
        body="Chains connect two related commitment markets into one all-or-nothing close. Both legs have to finish clean."
      />

      <div className="market-module-grid">
        {chains.map((chain) => (
          <GlassPanel key={chain.slug} className="market-module-card" floating={chain.status === "live"}>
            <div className="section-stack">
              <div className="row-between">
                <span className="status-pill" data-tone={chain.status}>
                  {chain.status}
                </span>
                <span className="metric-chip">{chain.totalStakedLabel}</span>
              </div>
              <div className="section-stack">
                <span className="mono-label">{chain.category}</span>
                <strong>{chain.title}</strong>
                <p className="detail-text">{chain.summary}</p>
              </div>
              <div className="timeline-list">
                <div className="summary-card">
                  <span className="mono-label">Leg A</span>
                  <strong>{chain.legA.poolTitle}</strong>
                  <span className="muted-text">{chain.legA.deadlineLabel}</span>
                </div>
                <div className="summary-card">
                  <span className="mono-label">Leg B</span>
                  <strong>{chain.legB.poolTitle}</strong>
                  <span className="muted-text">{chain.legB.deadlineLabel}</span>
                </div>
              </div>
              <div className="button-row">
                <Link className="action-primary" href={`/pools/${chain.legA.poolSlug}`}>
                  Open first leg
                </Link>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
