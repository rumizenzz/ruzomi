"use client";

import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, Clock3, Siren, Sparkles } from "lucide-react";

import { useSharedWalletState } from "@/components/live-data-hooks";
import { GlassPanel, SectionIntro } from "@/components/surfaces";

const toneMeta = {
  live: { label: "Due soon", icon: Siren },
  upcoming: { label: "Opening", icon: CalendarClock },
  settling: { label: "In review", icon: Sparkles },
  settled: { label: "Posted", icon: CheckCircle2 },
} as const;

export function NotificationsFeed() {
  const walletState = useSharedWalletState();
  const latestNotification = walletState.notifications[0] ?? null;

  return (
    <>
      <SectionIntro
        eyebrow="Notifications"
        title="Deadline reminders and result updates arrive with no filler."
        body="This channel handles countdown reminders, proof receipts, challenge notices, and settlement results."
      />

      <div className="notifications-center-grid">
        <GlassPanel className="notifications-summary-card">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Inbox state</span>
            <h2 className="section-title">What needs attention next</h2>
            <p className="section-copy">
              Keep alerts light. Open the inbox when something actually needs a decision, proof action, or schedule change.
            </p>
          </div>

          <div className="notifications-summary-grid">
            <div className="notifications-summary-item">
              <Bell size={16} />
              <div>
                <strong>{walletState.notifications.length}</strong>
                <p className="detail-text">Active reminders</p>
              </div>
            </div>

            <div className="notifications-summary-item">
              <Clock3 size={16} />
              <div>
                <strong>{walletState.rewardProgress.inviteCountdown?.label ?? "No countdown running"}</strong>
                <p className="detail-text">Referral timing</p>
              </div>
            </div>
          </div>

          {latestNotification ? (
            <div className={`notifications-highlight notifications-highlight-${latestNotification.tone}`}>
              <div className="section-stack section-stack-tight">
                <span className="mono-label">Latest</span>
                <strong>{latestNotification.title}</strong>
                <p className="detail-text">{latestNotification.summary}</p>
              </div>
              <div className="surface-meta surface-meta-wrap">
                <span className={`notification-tone-chip notification-tone-chip-${latestNotification.tone}`}>
                  {(() => {
                    const Icon = toneMeta[latestNotification.tone].icon;
                    return <Icon size={13} />;
                  })()}
                  {toneMeta[latestNotification.tone].label}
                </span>
                <span className="mono-label">{latestNotification.time}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state notifications-empty">No new updates are waiting right now.</div>
          )}

          <div className="button-row notifications-actions">
            <Link className="action-secondary" href="/settings">
              Notification settings
            </Link>
            <Link className="action-secondary" href="/app/reliability">
              Rewards & access
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="notifications-stream-card">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Live queue</span>
            <h2 className="section-title">All reminders</h2>
          </div>

          <div className="notifications-stream-list">
            {walletState.notifications.length ? (
              walletState.notifications.map((note) => {
                const Icon = toneMeta[note.tone].icon;

                return (
                  <div key={note.id} className={`notifications-stream-item notifications-stream-item-${note.tone}`}>
                    <div className={`notification-icon notification-icon-${note.tone}`}>
                      <Icon size={15} />
                    </div>
                    <div className="section-stack section-stack-tight">
                      <div className="notification-item-head">
                        <strong>{note.title}</strong>
                        <span className={`notification-tone-chip notification-tone-chip-${note.tone}`}>
                          {toneMeta[note.tone].label}
                        </span>
                      </div>
                      <p className="detail-text">{note.summary}</p>
                    </div>
                    <span className="mono-label">{note.time}</span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state notifications-empty">The inbox is clear. New reminders will land here as the board changes.</div>
            )}
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
