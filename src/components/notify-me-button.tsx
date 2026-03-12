"use client";

import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function NotifyMeButton({
  poolSlug,
  compact = false,
  opensAtLabel,
  opensInLabel,
  joinClosesAtLabel,
  joinClosesInLabel,
  timingSummaryLabel,
  className,
}: {
  poolSlug: string;
  compact?: boolean;
  opensAtLabel?: string;
  opensInLabel?: string | null;
  joinClosesAtLabel?: string;
  joinClosesInLabel?: string | null;
  timingSummaryLabel?: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch(`/api/notify-me?poolSlug=${encodeURIComponent(poolSlug)}`, {
        cache: "no-store",
      });

      if (cancelled || response.status === 401) {
        return;
      }

      if (!response.ok) {
        return;
      }

      const json = (await response.json()) as { subscription?: { active?: boolean } | null };
      if (!cancelled) {
        setActive(Boolean(json.subscription?.active));
        setErrorMessage(null);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [poolSlug]);

  async function toggle() {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/notify-me", {
        method: active ? "DELETE" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ poolSlug }),
      });

      if (response.status === 401) {
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.assign(`/login?next=${next}`);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(payload?.error ?? "We could not save your reminder right now.");
        return;
      }

      setActive(!active);
    } catch {
      setErrorMessage("We could not save your reminder right now.");
    } finally {
      setLoading(false);
    }
  }

  const scheduleLine =
    timingSummaryLabel ??
    (opensInLabel && joinClosesInLabel
      ? `${opensInLabel} • ${joinClosesInLabel}`
      : opensAtLabel && joinClosesAtLabel
        ? `Opens ${opensAtLabel} • join closes ${joinClosesAtLabel}`
        : opensInLabel
          ? opensInLabel
          : joinClosesInLabel
            ? joinClosesInLabel
            : opensAtLabel
              ? `Opens ${opensAtLabel}`
              : joinClosesAtLabel
                ? `Join closes ${joinClosesAtLabel}`
                : null);

  const coverageLine = active
    ? "Open, join-close, and schedule reminders are active."
    : "Get opening, join-close, and schedule reminders.";

  if (compact) {
    return (
      <button
        className={clsx("notify-me-button", "is-compact", active && "is-active", className)}
        onClick={toggle}
        type="button"
      >
        {active ? <BellRing size={14} aria-hidden="true" /> : <Bell size={14} aria-hidden="true" />}
        <span>{loading ? "Saving..." : active ? "Reminder on" : "Notify me"}</span>
      </button>
    );
  }

  return (
    <div className={clsx("notify-me-panel", active && "is-active", className)}>
      <button
        className={clsx("notify-me-button", active && "is-active")}
        onClick={toggle}
        type="button"
      >
        {active ? <BellRing size={14} aria-hidden="true" /> : <Bell size={14} aria-hidden="true" />}
        <span>{loading ? "Saving..." : active ? "Reminder on" : "Notify me"}</span>
      </button>
      <div className="notify-me-copy">
        <strong>{active ? "Reminder saved" : "Get market reminders"}</strong>
        {scheduleLine ? <span>{scheduleLine}</span> : null}
        <span>{coverageLine}</span>
        {errorMessage ? <span className="notify-me-error">{errorMessage}</span> : null}
      </div>
    </div>
  );
}
