import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, TimerReset, TrendingUp } from "lucide-react";
import clsx from "clsx";

import type { CommitmentPool, LeaderboardEntry, NetworkLedgerEntry, SparkEvent } from "@/lib/types";

export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="section-stack">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      <p className="section-copy">{body}</p>
    </div>
  );
}

export function HeroIntro({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-stack">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-copy">{body}</p>
      {children}
    </div>
  );
}

export function GlassPanel({
  className,
  children,
  floating = false,
}: {
  className?: string;
  children: React.ReactNode;
  floating?: boolean;
}) {
  return (
    <section className={clsx("glass-panel", floating && "is-float", className)}>
      {children}
    </section>
  );
}

export function PoolCard({ pool, href }: { pool: CommitmentPool; href?: string }) {
  return (
    <GlassPanel className="pool-card page-hero-card" floating={pool.status === "live"}>
      <div className="pool-card-header">
        <div className="row-between">
          <span className="status-pill" data-tone={pool.status}>
            {pool.status === "live" && <span className="live-dot" />}
            {pool.status.toUpperCase()}
          </span>
          <span className="metric-chip">
            <TrendingUp size={16} />
            {pool.trendLabel}
          </span>
        </div>
        <div className="section-stack">
          <div className="pool-title-row">
            <div>
              <p className="data-title">{pool.category}</p>
              <h2 className="pool-title">{pool.title}</h2>
            </div>
            <div className="icon-chip">
              <Flame size={20} />
            </div>
          </div>
          <p className="section-copy">{pool.summary}</p>
        </div>
      </div>

      <div className="metric-strip">
        <div className="summary-card">
          <span className="mono-label">Market size</span>
          <strong>{pool.volumeLabel}</strong>
          <span className="muted-text">{pool.participantCount} active entries</span>
        </div>
        <div className="summary-card">
          <span className="mono-label">Deadline</span>
          <strong>{pool.closesAt}</strong>
          <span className="muted-text">{pool.proofWindow} to submit evidence</span>
        </div>
        <div className="summary-card">
          <span className="mono-label">Evidence</span>
          <strong>{pool.evidenceMode}</strong>
          <span className="muted-text">{pool.challengeWindow} challenge window</span>
        </div>
      </div>

      <div className="action-row">
        <Link className="action-primary" href={href ?? `/pools/${pool.slug}`}>
          Open market
          <ArrowRight size={16} />
        </Link>
        <span className="action-secondary">{pool.payoutLabel}</span>
      </div>
    </GlassPanel>
  );
}

export function SparkCard({ item }: { item: SparkEvent }) {
  return (
    <div className="feed-item">
      <div className="icon-chip">
        <ShieldCheck size={18} />
      </div>
      <div className="section-stack">
        <div className="row-between">
          <strong>{item.actor}</strong>
          <span className="muted-text">{item.handle}</span>
        </div>
        <p className="detail-text">{item.message}</p>
        <div className="surface-meta">
          <span>{item.context}</span>
          <span>{item.reactionCount} reactions</span>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <div className="timeline-item">
      <div className="timeline-index">{index + 1}</div>
      <div className="section-stack">
        <div className="row-between">
          <strong>{entry.name}</strong>
          <span className="status-pill" data-tone="settled">
            {entry.tier}
          </span>
        </div>
        <div className="surface-meta">
          <span>Result score {entry.score}</span>
          <span>{entry.streakDays}-day streak</span>
          <span>{entry.verifiedPools} verified pools</span>
          <span>{entry.winRate} result rate</span>
        </div>
      </div>
    </div>
  );
}

export function LedgerTable({ entries }: { entries: NetworkLedgerEntry[] }) {
  return (
    <div className="data-table">
      <div className="table-header">
        <span>Market</span>
        <span>Event</span>
        <span>State</span>
        <span>Close</span>
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className="table-row">
          <div className="section-stack">
            <strong>{entry.poolTitle}</strong>
            <span className="mono-label">{entry.timestamp}</span>
          </div>
          <span>{entry.event}</span>
          <span className="table-tag">{entry.networkState ?? entry.proofStatus}</span>
          <span>{entry.amountLabel ? `${entry.settlement} · ${entry.amountLabel}` : entry.settlement}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartSurface() {
  return (
    <div className="live-chart" aria-hidden="true">
      <svg viewBox="0 0 560 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 181.5C48 181.5 72 71 120 71C168 71 192 170 240 170C288 170 312 42 360 42C408 42 432 115 480 115C516 115 534 81 560 81"
          stroke="url(#chart-cyan)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M0 137C42 137 63 112 105 112C147 112 168 161 210 161C252 161 273 91 315 91C357 91 378 134 420 134C462 134 483 58 525 58C539 58 550 61 560 70"
          stroke="url(#chart-violet)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 10"
        />
        <defs>
          <linearGradient id="chart-cyan" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0EDDFD" />
            <stop offset="0.55" stopColor="#09CBEA" />
            <stop offset="1" stopColor="#0A9DBB" />
          </linearGradient>
          <linearGradient id="chart-violet" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B6F6FF" />
            <stop offset="0.55" stopColor="#6EDDF2" />
            <stop offset="1" stopColor="#2DB7D2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function TimelineItem({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <div className="timeline-item">
      <div className="timeline-index">
        <TimerReset size={18} />
      </div>
      <div className="section-stack">
        <strong>
          {index + 1}. {title}
        </strong>
        <p className="detail-text">{body}</p>
      </div>
    </div>
  );
}
