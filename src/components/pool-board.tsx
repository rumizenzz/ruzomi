import Link from "next/link";
import clsx from "clsx";

import { NotifyMeButton } from "@/components/notify-me-button";
import type { CommitmentPool } from "@/lib/types";

function formatEntries(count: number) {
  return `${count.toLocaleString()} joined`;
}

function getStatusLabel(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return "early stake live";
  }

  switch (pool.lifecycleState) {
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
      return pool.status === "settling" ? "under review" : pool.status;
  }
}

function getParticipationLabel(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return "early access is live";
  }

  if (pool.notifyMeAvailable) {
    return "notify me available";
  }

  if (pool.lifecycleState === "join_closed_active") {
    return "existing members only";
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return "proof and review in progress";
  }

  return formatEntries(pool.participantCount);
}

function getTimingPrimary(pool: CommitmentPool) {
  if (
    pool.preOpenStakeLive ||
    pool.notifyMeAvailable ||
    pool.lifecycleState === "join_open" ||
    pool.lifecycleState === "join_closing_soon"
  ) {
    return pool.joinStatusLabel;
  }

  if (pool.lifecycleState === "join_closed_active") {
    return "Join closed";
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return "Proof window";
  }

  return pool.closesAt;
}

function getTimingSecondary(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return pool.timingSummaryLabel ?? pool.proofWindow;
  }

  if (pool.notifyMeAvailable) {
    return pool.timingSummaryLabel ?? `Join closes ${pool.closesAt}`;
  }

  if (pool.lifecycleState === "join_open" || pool.lifecycleState === "join_closing_soon") {
    return pool.timingSummaryLabel ?? pool.proofWindow;
  }

  if (pool.lifecycleState === "join_closed_active") {
    return pool.timingSummaryLabel ?? pool.proofWindow;
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return pool.resultState;
  }

  return pool.evidenceMode;
}

function getActionLabel(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return "Stake early";
  }

  if (pool.notifyMeAvailable) {
    return "View timing";
  }

  if (pool.lifecycleState === "join_closed_active") {
    return "View progress";
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return "View proof";
  }

  return "View market";
}

export function PoolBoard({
  pools,
  className,
  emptyMessage = "No markets are live in this category yet.",
  showHeader = true,
}: {
  pools: CommitmentPool[];
  className?: string;
  emptyMessage?: string;
  showHeader?: boolean;
}) {
  return (
    <div className={clsx("pool-board-shell", className)}>
      {showHeader ? (
        <div className="market-board-head">
          <span>Market</span>
          <span>Size</span>
          <span>Deadline</span>
          <span>Result</span>
          <span>Actions</span>
        </div>
      ) : null}

      <div className="market-board-list">
        {pools.length ? (
          pools.map((pool) => (
            <article key={pool.slug} className="market-board-row">
              <div className="market-board-main">
                <div className="market-board-kicker">
                  <span className="data-title">{pool.category}</span>
                  <span className="market-board-kicker-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>{getParticipationLabel(pool)}</span>
                  <span className="market-board-kicker-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="status-pill" data-tone={pool.status}>
                    {pool.lifecycleState === "join_open" || pool.lifecycleState === "join_closing_soon" ? (
                      <span className="live-dot" />
                    ) : null}
                    {getStatusLabel(pool)}
                  </span>
                </div>
                <strong>
                  <Link className="market-board-title-link" href={`/pools/${pool.slug}`}>
                    {pool.title}
                  </Link>
                </strong>
                <span className="market-board-note">{pool.timingSummaryLabel ?? pool.joinStatusLabel}</span>
              </div>
              <div className="market-board-meta">
                <strong>{pool.visiblePoolTotal ? pool.volumeLabel : pool.targetGoal}</strong>
                <span>{pool.visiblePoolTotal ? pool.stakeBand : `${pool.stakeFloor} floor`}</span>
                {pool.visiblePoolTotal ? (
                  <span className="market-board-note">{pool.trendLabel}</span>
                ) : (
                  <span className="market-board-note">Exact total reveals after the published threshold is met.</span>
                )}
              </div>
              <div className="market-board-meta">
                <strong>{getTimingPrimary(pool)}</strong>
                <strong>{pool.evidenceMode}</strong>
                <span>{getTimingSecondary(pool)}</span>
              </div>
              <div className="market-board-meta">
                <strong>{pool.resolvesAt}</strong>
                <span>{pool.resultState}</span>
              </div>
              <div className="market-board-actions">
                <Link className="action-secondary market-board-action-link" href={`/pools/${pool.slug}`}>
                  {getActionLabel(pool)}
                </Link>
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
                {pool.marketOpenReminderAvailable ? (
                  <span className="market-board-note market-board-note-action">
                    {pool.preOpenStakeLive
                      ? pool.timingSummaryLabel ?? "Early stake is live. Reminders cover the official opening, join close, and schedule changes."
                      : pool.timingSummaryLabel ?? "Reminders cover the opening, join close, and schedule changes."}
                  </span>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state market-board-empty">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
