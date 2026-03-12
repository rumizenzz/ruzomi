import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { getFeeSchedule, getPoolBySlug, listPools } from "@/lib/paytocommit-data";

export async function generateStaticParams() {
  const pools = await listPools();
  return pools.map((pool) => ({ slug: pool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);

  if (!pool) {
    return { title: "Rules not found" };
  }

  return {
    title: `${pool.title} Rules`,
    description: `Rules for ${pool.title}: deadline, proof requirement, challenge window, invalidation, and payout math.`,
  };
}

export default async function PoolRulesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);
  const feeSchedule = getFeeSchedule();

  if (!pool) {
    notFound();
  }

  return (
    <section className="section-stack">
      <div className="pool-breadcrumbs">
        <Link href="/pools">Commitment Markets</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/pools/${pool.slug}`}>{pool.title}</Link>
        <span aria-hidden="true">/</span>
        <span>Rules</span>
      </div>

      <SectionIntro
        eyebrow="Rules"
        title={`${pool.title}`}
        body="Deadline, proof, review, invalidation, and payout math."
      />

      <section className="split-grid">
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Proof and deadline</h2>
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Deadline</span>
                <strong>{pool.closesAt}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Proof mode</span>
                <strong>{pool.evidenceMode}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Proof window</span>
                <strong>{pool.proofWindow}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Challenge window</span>
                <strong>{pool.challengeWindow}</strong>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Payout math</h2>
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Stake floor</span>
                <strong>{pool.stakeFloor}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Sovereign Spark</span>
                <strong>{feeSchedule.infrastructureFee}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Completed side</span>
                <strong>{feeSchedule.payoutRule}</strong>
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
          <h2 className="section-title">Rule set</h2>
          <div className="timeline-list">
            {pool.ruleHighlights.map((rule, index) => (
              <div key={rule} className="timeline-item">
                <div className="timeline-index">{index + 1}</div>
                <div className="section-stack">
                  <strong>Rule {index + 1}</strong>
                  <p className="detail-text">{rule}</p>
                </div>
              </div>
            ))}
            <div className="timeline-item">
              <div className="timeline-index">4</div>
              <div className="section-stack">
                <strong>Invalid proof</strong>
                <p className="detail-text">
                  Late proof, edited evidence, missing timestamps, or evidence that does not match the written
                  rule closes the entrant on the missed side unless an autonomous exception flow records a verified site incident.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">5</div>
              <div className="section-stack">
                <strong>Recorded result</strong>
                <p className="detail-text">
                  Final result, PayToCommit capture, payout release, and any reward issuance are posted to the
                  Commitment Network ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}
