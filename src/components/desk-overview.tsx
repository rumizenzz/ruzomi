"use client";

import Link from "next/link";

import { buildAuthHref, buildFundingHref } from "@/lib/auth-flow";
import { CreationForge } from "@/components/creation-forge";
import { useSharedSiteState, useSharedWalletState } from "@/components/live-data-hooks";
import { MarketTrendChart } from "@/components/market-trend-chart";
import { ResultCardStack } from "@/components/result-card-stack";
import type { CommitmentPool, ResultCard } from "@/lib/types";

export function DeskOverview({
  livePools,
  openingPools,
}: {
  livePools: CommitmentPool[];
  openingPools: CommitmentPool[];
}) {
  const walletState = useSharedWalletState();
  const siteState = useSharedSiteState();
  const isAuthenticated = Boolean(walletState.viewer);
  const addFundsHref = buildFundingHref({
    isAuthenticated,
    identityStatus: walletState.viewer?.identityStatus,
  });
  const historyHref = isAuthenticated ? "/app/history" : buildAuthHref("login", "/app/history");
  const resultCards: ResultCard[] = walletState.tickets
    .filter((ticket) => ticket.status !== "active")
    .slice(0, 4)
    .map((ticket) => ({
      ticketId: ticket.id,
      type: ticket.status === "completed" ? "completed" : "missed",
      title: ticket.status === "completed" ? "Commitment closed" : "Reset and reload",
      subtitle: ticket.poolTitle,
      summary:
        ticket.status === "completed"
          ? "The market closed on the completed side and the result is ready to share."
          : "The market missed the close. The result still lands in your visible history.",
      netResultLabel: ticket.stakeLabel,
      downloadPath: `/api/result-cards/${ticket.id}`,
      createdAt: ticket.joinedAt,
    }));

  return (
    <div className="section-stack portfolio-dashboard">
      <section className="split-grid dashboard-secondary-grid">
        <div className="glass-panel dashboard-balance-card">
          <div className="section-stack">
            <span className="eyebrow">My Portfolio</span>
            <h1 className="section-title">{walletState.wallet.availableLabel}</h1>
            <p className="section-copy">Available cash for markets and Chains.</p>
          </div>
          <div className="button-row">
            <Link className="action-primary" href={addFundsHref}>
              Add funds
            </Link>
            <Link className="action-secondary" href={historyHref}>
              Open history
            </Link>
          </div>
          <div className="timeline-list">
            <div className="summary-card">
              <span className="mono-label">Live markets</span>
              <strong>{siteState.livePoolCount}</strong>
            </div>
            <div className="summary-card">
              <span className="mono-label">Open tickets</span>
              <strong>{walletState.tickets.filter((ticket) => ticket.status === "active").length}</strong>
            </div>
            <div className="summary-card">
              <span className="mono-label">Alerts</span>
              <strong>{walletState.notifications.length}</strong>
            </div>
          </div>
        </div>

        <div className="glass-panel dashboard-active-card">
          <div className="section-stack">
            <span className="eyebrow">Active now</span>
            <h2 className="section-title">Open commitment markets</h2>
          </div>
          <div className="board-lane-list">
            {livePools.slice(0, 3).map((pool) => (
              <Link key={pool.slug} className="board-lane-item" href={`/pools/${pool.slug}`}>
                <div>
                  <p className="data-title">{pool.category}</p>
                  <strong>{pool.title}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{pool.visiblePoolTotal ? pool.volumeLabel : pool.stakeBand}</span>
                  <span>{pool.sparkCount} Spark</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="split-grid dashboard-secondary-grid">
        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Open tickets</span>
            <h2 className="section-title">Current tickets</h2>
          </div>
          <div className="market-module-grid market-module-grid-tight">
            {walletState.tickets.slice(0, 4).map((ticket, index) => {
              const pool = livePools.find((item) => item.slug === ticket.poolSlug) ?? openingPools[index];
              return (
                <div key={ticket.id} className="market-module-card market-module-card-tight">
                  <div className="section-stack">
                    <div className="row-between">
                      <span className="mono-label">{ticket.status}</span>
                      <span className="metric-chip">{ticket.stakeLabel}</span>
                    </div>
                    <strong>{ticket.poolTitle}</strong>
                    <p className="detail-text">{ticket.resultLabel}</p>
                  </div>
                  {pool?.trendPoints ? <MarketTrendChart points={pool.trendPoints} /> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel">
          <CreationForge compact />
        </div>
      </section>

      <section className="split-grid dashboard-secondary-grid">
        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Shareable closes</span>
            <h2 className="section-title">Result cards</h2>
          </div>
          <ResultCardStack cards={resultCards} />
        </div>

        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Notifications</span>
            <h2 className="section-title">Recent updates</h2>
          </div>
          <div className="timeline-list">
            {walletState.notifications.map((note) => (
              <div key={note.id} className="timeline-item">
                <div className="timeline-index">{note.time}</div>
                <div className="section-stack">
                  <strong>{note.title}</strong>
                  <p className="detail-text">{note.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
