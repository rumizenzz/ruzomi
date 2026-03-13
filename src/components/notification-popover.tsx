"use client";

import Link from "next/link";
import { Bell, CalendarClock, CheckCircle2, Siren, Sparkles } from "lucide-react";

import type { NotificationEvent } from "@/lib/types";

const toneMeta: Record<
  NotificationEvent["tone"],
  {
    label: string;
    icon: typeof Sparkles;
  }
> = {
  live: { label: "Due soon", icon: Siren },
  upcoming: { label: "Opening", icon: CalendarClock },
  settling: { label: "In review", icon: Sparkles },
  settled: { label: "Posted", icon: CheckCircle2 },
};

export function NotificationPopover({ notifications }: { notifications: NotificationEvent[] }) {
  const latestNotification = notifications[0] ?? null;

  return (
    <details className="market-console market-console-right notification-console">
      <summary className="icon-action-button shell-icon-button-dark notification-summary" aria-label="Open notifications">
        <Bell size={18} />
        {notifications.length ? <span className="icon-badge">{notifications.length}</span> : null}
      </summary>
      <div className="market-console-panel market-console-panel-right shell-menu-panel notification-panel">
        <div className="market-console-header">
          <strong className="market-console-title">Notifications</strong>
          <span className="mono-label">{notifications.length ? `${notifications.length} waiting` : "All clear"}</span>
        </div>

        {notifications.length ? (
          <>
            {latestNotification ? (
              <Link
                className={`notification-spotlight notification-item-${latestNotification.tone}`}
                href="/app/notifications"
              >
                <div className="notification-spotlight-copy">
                  <span className="mono-label">Latest reminder</span>
                  <strong>{latestNotification.title}</strong>
                  <p className="detail-text">{latestNotification.summary}</p>
                </div>
                <div className="notification-spotlight-meta">
                  <span className={`notification-tone-chip notification-tone-chip-${latestNotification.tone}`}>
                    {(() => {
                      const Icon = toneMeta[latestNotification.tone].icon;
                      return <Icon size={13} />;
                    })()}
                    {toneMeta[latestNotification.tone].label}
                  </span>
                  <span className="mono-label">{latestNotification.time}</span>
                </div>
              </Link>
            ) : null}

            <div className="notification-list">
              {notifications.slice(1, 6).map((note) => {
                const Icon = toneMeta[note.tone].icon;

                return (
                  <Link key={note.id} className={`notification-item notification-item-${note.tone}`} href="/app/notifications">
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
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="notification-empty">
            <strong>Nothing is waiting right now</strong>
            <p className="detail-text">Proof reminders, result notices, and Spark activity will show up here as they land.</p>
          </div>
        )}

        <div className="button-row button-row-tight">
          <Link className="action-secondary" href="/app/notifications">
            Open inbox
          </Link>
          <Link className="action-secondary" href="/settings#settings-notifications">
            Settings
          </Link>
        </div>
      </div>
    </details>
  );
}
