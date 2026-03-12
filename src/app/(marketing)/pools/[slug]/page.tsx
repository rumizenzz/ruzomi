import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketTrendChart } from "@/components/market-trend-chart";
import { NotifyMeButton } from "@/components/notify-me-button";
import { PoolTicketPanel } from "@/components/pool-ticket-panel";
import { SparkThread } from "@/components/spark-thread";
import { GlassPanel, LedgerTable, SectionIntro } from "@/components/surfaces";
import { formatDateLabel, getFeeSchedule, getPoolBySlug, getWalletState, listChains, listNetworkLedger, listPools } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken, getAuthenticatedSupabaseUser } from "@/lib/supabase/authenticated-user";
import type { CommitmentPool } from "@/lib/types";

function getLifecycleLabel(lifecycleState: CommitmentPool["lifecycleState"]) {
  switch (lifecycleState) {
    case "scheduled":
      return "scheduled";
    case "upcoming":
      return "upcoming";
    case "join_closing_soon":
      return "join closing";
    case "join_closed_active":
      return "join closed";
    case "proof_window_open":
      return "proof window";
    case "proof_window_closed":
    case "under_review":
      return "under review";
    case "resolved":
      return "resolved";
    case "voided":
      return "voided";
    case "canceled":
      return "canceled";
    default:
      return "live";
  }
}

export async function generateStaticParams() {
  return (await listPools()).map((pool) => ({ slug: pool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);

  if (!pool) {
    return {
      title: "Market not found",
    };
  }

  return {
    title: pool.title,
    description: `${pool.summary} Proof mode: ${pool.evidenceMode}. Deadline: ${pool.closesAt}.`,
    alternates: {
      canonical: `/pools/${pool.slug}`,
    },
    openGraph: {
      title: `${pool.title} | PayToCommit`,
      description: pool.summary,
      url: `https://paytocommit.com/pools/${pool.slug}`,
    },
  };
}

export default async function PoolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);

  if (!pool) {
    notFound();
  }

  const [pools, ledgerEntries, chains, authUser, sessionToken] = await Promise.all([
    listPools(),
    listNetworkLedger(slug),
    listChains(),
    getAuthenticatedSupabaseUser(),
    getAuthenticatedAppSessionToken(),
  ]);
  const walletState = sessionToken ? await getWalletState(sessionToken) : null;
  const feeSchedule = getFeeSchedule();
  const relatedPools = pools.filter((candidate) => candidate.category === pool.category && candidate.slug !== pool.slug).slice(0, 3);
  const relatedChains = chains.filter((chain) => chain.legA.poolSlug === pool.slug || chain.legB.poolSlug === pool.slug);

  return (
    <section className="pool-detail-grid">
      <div className="section-stack">
        <GlassPanel className="pool-hero-panel" floating={pool.status === "live"}>
          <div className="section-stack">
            <div className="pool-breadcrumbs">
              <Link href="/pools">Commitment Markets</Link>
              <span aria-hidden="true">/</span>
              <span>{pool.category}</span>
            </div>
            <div className="row-between">
              <span className="status-pill" data-tone={pool.status}>
                {pool.lifecycleState === "join_open" || pool.lifecycleState === "join_closing_soon" ? (
                  <span className="live-dot" />
                ) : null}
                {getLifecycleLabel(pool.lifecycleState)}
              </span>
              <div className="detail-chip-row">
                <span className="metric-chip">{pool.visiblePoolTotal ? pool.volumeLabel : pool.targetGoal}</span>
                {pool.marketOpenReminderAvailable ? (
                  <NotifyMeButton
                    compact
                    joinClosesAtLabel={pool.joinClosesAtLabel}
                    joinClosesInLabel={pool.joinClosesInLabel}
                    opensAtLabel={pool.opensAtLabel}
                    opensInLabel={pool.opensInLabel}
                    poolSlug={pool.slug}
                    timingSummaryLabel={pool.timingSummaryLabel}
                  />
                ) : null}
              </div>
            </div>

            <div className="section-stack">
              <div>
                <p className="data-title">{pool.category}</p>
                <h1 className="hero-title pool-detail-title">{pool.title}</h1>
              </div>
              <p className="hero-copy">{pool.summary}</p>
            </div>

            <MarketTrendChart points={pool.trendPoints ?? []} />

            {relatedPools.length ? (
              <div className="pool-fractal-rail">
                <div className="row-between">
                  <div className="section-stack section-stack-tight">
                    <span className="mono-label">Fractal rail</span>
                    <strong>Drill into related commitments</strong>
                  </div>
                  <span className="muted-text">Open one to promote it into the full market view.</span>
                </div>
                <div className="pool-fractal-grid">
                  {relatedPools.map((candidate) => (
                    <Link key={candidate.slug} className="pool-fractal-card" href={`/pools/${candidate.slug}`}>
                      <div className="row-between">
                        <span className="status-pill" data-tone={candidate.status}>
                          {getLifecycleLabel(candidate.lifecycleState)}
                        </span>
                        <span className="metric-chip">
                          {candidate.visiblePoolTotal ? candidate.volumeLabel : candidate.stakeBand}
                        </span>
                      </div>
                      <div className="section-stack section-stack-tight">
                        <span className="mono-label">{candidate.category}</span>
                        <strong>{candidate.title}</strong>
                        <span className="detail-text">{candidate.joinStatusLabel}</span>
                      </div>
                      <MarketTrendChart compact points={candidate.trendPoints ?? []} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="detail-signal-grid">
              <div className="summary-card">
                <span className="mono-label">Spark</span>
                <strong>{pool.sparkCount}</strong>
                <span className="muted-text">live messages on this market</span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Tickets</span>
                <strong>{pool.ticketCount}</strong>
                <span className="muted-text">{pool.participantCount.toLocaleString()} participants active</span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Proof mode</span>
                <strong>{pool.evidenceMode}</strong>
                <span className="muted-text">{pool.challengeWindow}</span>
              </div>
            </div>

            <div className="metric-strip">
              <div className="summary-card">
                <span className="mono-label">Pool</span>
                <strong>{pool.visiblePoolTotal ? pool.volumeLabel : pool.stakeBand}</strong>
                <span className="muted-text">
                  {pool.visiblePoolTotal ? `${pool.participantCount.toLocaleString()} joined` : pool.targetGoal}
                </span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Join window</span>
                <strong>{pool.joinStatusLabel}</strong>
                <span className="muted-text">
                  {pool.timingSummaryLabel ??
                    `${pool.opensInLabel ?? `Opens ${formatDateLabel(pool.joinOpensAt)}`} · ${
                      pool.joinClosesInLabel ?? `Join closes ${formatDateLabel(pool.joinClosesAt)}`
                    }`}
                </span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Result</span>
                <strong>{pool.resolvesAt}</strong>
                <span className="muted-text">{pool.resultState}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionIntro
            eyebrow="Rules"
            title="Rules"
            body="Deadline, proof, review, and payout conditions for this market."
          />
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
          </div>
        </GlassPanel>

        <section className="split-grid">
          <GlassPanel>
            <SparkThread
              body="Live discussion for this market."
              poolSlug={pool.slug}
              title="Spark"
            />
          </GlassPanel>

          <GlassPanel>
            <SectionIntro
              eyebrow="Commitment Network"
              title="Network"
              body="Stake, proof, fee, and payout entries."
            />
            {ledgerEntries.length ? (
              <LedgerTable entries={ledgerEntries} />
            ) : (
              <div className="empty-state">No network entries have published for this pool yet.</div>
            )}
          </GlassPanel>
        </section>
      </div>

      <div className="market-side-stack">
        <GlassPanel className="spotlight-ticket-card pool-ticket-card">
          <PoolTicketPanel
            availableBalanceCents={walletState?.wallet.availableCents ?? 0}
            availableBalanceLabel={walletState?.wallet.availableLabel ?? "$0"}
            challengeWindow={pool.challengeWindow}
            chains={relatedChains}
            isAuthenticated={Boolean(authUser)}
            isIdentityVerified={walletState?.viewer?.identityStatus === "verified"}
            joinClosesAtLabel={pool.joinClosesAtLabel ?? formatDateLabel(pool.joinClosesAt)}
            joinClosesInLabel={pool.joinClosesInLabel}
            joinStatusLabel={pool.joinStatusLabel}
            lifecycleState={pool.lifecycleState}
            marketOpenReminderAvailable={pool.marketOpenReminderAvailable}
            notifyMeAvailable={pool.notifyMeAvailable}
            opensAtLabel={pool.opensAtLabel ?? formatDateLabel(pool.opensAt)}
            opensInLabel={pool.opensInLabel}
            preOpenStakeLive={pool.preOpenStakeLive}
            poolSlug={pool.slug}
            poolTitle={pool.title}
            proofMode={pool.evidenceMode}
            relatedPools={relatedPools}
            resultState={pool.resultState}
            stakeBand={pool.stakeBand}
            stakeFloorCents={pool.stakeFloorCents ?? 1000}
            stakeFloorLabel={pool.stakeFloor}
            stakeMaxCents={pool.stakeMaxCents ?? 10000}
            timingSummaryLabel={pool.timingSummaryLabel}
          />
        </GlassPanel>

        {pool.marketOpenReminderAvailable ? (
          <GlassPanel className="detail-rail-card">
            <div className="section-stack section-stack-tight">
              <SectionIntro
                eyebrow="Notify me"
                title="Get an opening reminder"
                body={
                  pool.preOpenStakeLive
                    ? "Early stake is already live. Turn on reminders for the official opening, join-close notice, and schedule changes."
                    : "Track the opening, the join-close reminder, and any schedule changes for this market."
                }
              />
              <NotifyMeButton
                joinClosesAtLabel={pool.joinClosesAtLabel}
                joinClosesInLabel={pool.joinClosesInLabel}
                opensAtLabel={pool.opensAtLabel}
                opensInLabel={pool.opensInLabel}
                poolSlug={pool.slug}
                timingSummaryLabel={pool.timingSummaryLabel}
              />
            </div>
          </GlassPanel>
        ) : null}

        <GlassPanel className="detail-rail-card">
          <SectionIntro
            eyebrow="Timeline"
            title="Timeline"
            body="Open, join close, proof, and result targets."
          />
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-index">1</div>
              <div className="section-stack">
                <strong>Market opens</strong>
                <p className="detail-text">
                  {pool.opensInLabel ?? "Already open"} · {formatDateLabel(pool.opensAt)}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">2</div>
              <div className="section-stack">
                <strong>Join closes</strong>
                <p className="detail-text">
                  {pool.joinClosesInLabel ?? "Join closed"} · {formatDateLabel(pool.joinClosesAt)}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">3</div>
              <div className="section-stack">
                <strong>Proof window</strong>
                <p className="detail-text">
                  {formatDateLabel(pool.proofWindowOpensAt)} to {formatDateLabel(pool.proofWindowClosesAt)}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">4</div>
              <div className="section-stack">
                <strong>Resolution target</strong>
                <p className="detail-text">{formatDateLabel(pool.resolutionTargetAt)}</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="detail-rail-card">
          <SectionIntro
            eyebrow="Commitment Network"
            title="Recorded state"
            body={pool.networkState}
          />
          <div className="timeline-list">
            <div className="summary-card">
              <span className="mono-label">Winner rule</span>
              <strong>{feeSchedule.payoutRule}</strong>
            </div>
            <div className="summary-card">
              <span className="mono-label">Zero completions</span>
              <strong>{feeSchedule.zeroCompleteCapture}</strong>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="detail-rail-card">
          <SectionIntro
            eyebrow={pool.category}
            title={`More in ${pool.category}`}
            body="Related markets."
          />
          <div className="board-lane-list">
            {relatedPools.map((candidate) => (
              <Link key={candidate.slug} className="board-lane-item" href={`/pools/${candidate.slug}`}>
                <div>
                  <p className="data-title">{candidate.category}</p>
                  <strong>{candidate.title}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{candidate.visiblePoolTotal ? candidate.volumeLabel : candidate.stakeBand}</span>
                  <span>{candidate.closesAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
