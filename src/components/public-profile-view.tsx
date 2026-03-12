import Link from "next/link";

import { ResultCardStack } from "@/components/result-card-stack";
import { GlassPanel } from "@/components/surfaces";
import { getRenderableGifUrl } from "@/lib/media";
import type { PublicProfile } from "@/lib/types";

export function PublicProfileView({ profile }: { profile: PublicProfile }) {
  return (
    <section className="section-stack public-profile-stack">
      <GlassPanel className="profile-hero-card">
        <div className="profile-hero-grid">
          <div className="section-stack">
            <span className="mono-label">@{profile.handle}</span>
            <h1 className="hero-title profile-title">{profile.displayName}</h1>
            <p className="hero-copy">{profile.headline}</p>
            <div className="profile-badge-row">
              <span className="profile-badge">Public member</span>
              <span className="profile-badge">{profile.streakLabel}</span>
              <span className="profile-badge">{profile.netResultLabel}</span>
            </div>
            <div className="profile-hero-meta">
              <span className={`spark-presence-label spark-presence-${profile.presenceStatus}`}>{profile.presenceStatus}</span>
              {profile.customActivity?.text ? (
                <span className="spark-activity-chip">
                  <span className="spark-activity-chip-label">Now</span>
                  <strong>{profile.customActivity.text}</strong>
                </span>
              ) : null}
              <span>{profile.homeBase}</span>
              <span>{profile.joinedAt}</span>
            </div>
            <div className="profile-hero-stat-strip">
              <div className="profile-hero-stat">
                <span>Goals Completed</span>
                <strong>{profile.completedCount}</strong>
              </div>
              <div className="profile-hero-stat">
                <span>Live now</span>
                <strong>{profile.activeCount}</strong>
              </div>
              <div className="profile-hero-stat">
                <span>Missed closes</span>
                <strong>{profile.missedCount}</strong>
              </div>
            </div>
          </div>

          <div className="profile-performance-panel">
            <div className="profile-performance-hero">
              <span className="eyebrow">Public performance</span>
              <strong>{profile.netResultLabel}</strong>
              <p className="detail-text">
                {profile.completedCount} closes recorded, {profile.activeCount} live markets, {profile.missedCount} missed closes.
              </p>
            </div>
            <div className="profile-performance-grid">
              <div className="summary-card">
                <span className="mono-label">Clean closes</span>
                <strong>{profile.completedCount}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Missed closes</span>
                <strong>{profile.missedCount}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Live now</span>
                <strong>{profile.activeCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <section className="split-grid">
        <GlassPanel className="profile-surface-card">
          <div className="section-stack">
            <span className="eyebrow">Live commitments</span>
            <h2 className="section-title">Open markets</h2>
            <p className="section-copy">Markets still running, proof windows still open, and deadlines still ahead.</p>
          </div>
          <div className="board-lane-list">
            {profile.currentMarkets.map((ticket) => (
              <Link key={ticket.id} className="board-lane-item profile-market-item" href={`/pools/${ticket.poolSlug}`}>
                <div className="section-stack">
                  <div className="surface-meta surface-meta-wrap">
                    <span className="data-title">{ticket.stakeLabel}</span>
                    <span>{ticket.proofStatus}</span>
                  </div>
                  <strong>{ticket.poolTitle}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{ticket.resultLabel}</span>
                  <span>{ticket.joinedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="profile-surface-card">
          <div className="section-stack">
            <span className="eyebrow">Goals Completed</span>
            <h2 className="section-title">Locked results</h2>
            <p className="section-copy">Completed and missed commitments that are already locked into profile history.</p>
          </div>
          <div className="board-lane-list">
            {profile.recentResults.map((ticket) => (
              <Link key={ticket.id} className="board-lane-item profile-market-item" href={`/pools/${ticket.poolSlug}`}>
                <div className="section-stack">
                  <div className="surface-meta surface-meta-wrap">
                    <span className="data-title">{ticket.status}</span>
                    <span>{ticket.stakeLabel}</span>
                  </div>
                  <strong>{ticket.poolTitle}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{ticket.resultLabel}</span>
                  <span>{ticket.joinedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </section>

      <GlassPanel className="profile-surface-card">
        <div className="section-stack">
          <span className="eyebrow">Result cards</span>
          <h2 className="section-title">Downloadable closes</h2>
          <p className="section-copy">Save the close, copy a share line, or move it straight into Spark.</p>
        </div>
        <ResultCardStack cards={profile.resultCards} />
      </GlassPanel>

      <section className="split-grid">
        <GlassPanel className="profile-surface-card">
          <div className="section-stack">
            <span className="eyebrow">Spark</span>
            <h2 className="section-title">Recent posts</h2>
            <p className="section-copy">The latest posts that are visible from this profile without exposing private proof files.</p>
          </div>
          <div className="feed-list profile-spark-list">
            {profile.sparkHighlights.map((message) => {
              const gifUrl = message.tenorGifUrl ? getRenderableGifUrl(message.tenorGifUrl) : null;

              return (
                <div key={message.id} className="feed-item profile-spark-item">
                  <div className="section-stack">
                    <div className="row-between">
                      <div className="section-stack">
                        <strong>{message.poolTitle ?? "Spark"}</strong>
                        <span className={`spark-presence-label spark-presence-${message.presenceStatus ?? "online"}`}>
                          {message.authorHandle}
                        </span>
                      </div>
                      <span className="muted-text">{message.createdAt}</span>
                    </div>
                    <p className="detail-text">{message.body}</p>
                    {gifUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="spark-feed-gif profile-spark-gif" src={gifUrl} />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </section>
    </section>
  );
}
