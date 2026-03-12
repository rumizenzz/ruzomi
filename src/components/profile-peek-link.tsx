import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

import { formatVisiblePublicHandle, getVisiblePublicHandle } from "@/lib/public-identity";
import type { PresenceStatus } from "@/lib/types";

type ProfilePeekStat = {
  label: string;
  value: string;
};

function formatPresenceLabel(status: PresenceStatus | undefined) {
  switch (status) {
    case "away":
      return "Away";
    case "dnd":
      return "Do Not Disturb";
    case "invisible":
      return "Invisible";
    case "online":
    default:
      return "Online";
  }
}

export function getPublicProfilePath(handle: string | null | undefined) {
  const visibleHandle = getVisiblePublicHandle(handle);
  return visibleHandle ? `/profiles/${visibleHandle}` : null;
}

export function ProfilePeekLink({
  displayName,
  handle,
  presenceStatus = "online",
  activity,
  contextLabel,
  stats = [],
  badges = [],
  className = "",
  triggerClassName = "",
  variant = "name",
}: {
  displayName: string;
  handle: string | null | undefined;
  presenceStatus?: PresenceStatus;
  activity?: string | null;
  contextLabel?: string | null;
  stats?: ProfilePeekStat[];
  badges?: string[];
  className?: string;
  triggerClassName?: string;
  variant?: "name" | "pill";
}) {
  const href = getPublicProfilePath(handle);
  const formattedHandle = formatVisiblePublicHandle(handle);
  const presenceLabel = formatPresenceLabel(presenceStatus);
  const triggerClasses = [
    variant === "pill" ? "profile-peek-trigger is-pill" : "profile-peek-trigger",
    triggerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const trigger = href ? (
    <Link className={triggerClasses} href={href}>
      {displayName}
    </Link>
  ) : (
    <span className={triggerClasses}>{displayName}</span>
  );

  return (
    <span className={["profile-peek-shell", className].filter(Boolean).join(" ")}>
      {trigger}
      <span className="profile-peek-card" role="note">
        <span className="profile-peek-head">
          <span className={`spark-presence-label spark-presence-${presenceStatus} spark-presence-chip`}>
            {presenceLabel}
          </span>
          <span className="profile-peek-badge-row">
            <span className="profile-peek-badge">
              <ShieldCheck aria-hidden="true" size={12} />
              Member
            </span>
            {badges.slice(0, 2).map((badge) => (
              <span key={badge} className="profile-peek-badge">
                <Sparkles aria-hidden="true" size={12} />
                {badge}
              </span>
            ))}
          </span>
        </span>

        <span className="profile-peek-body">
          <strong>{displayName}</strong>
          <span className="surface-meta surface-meta-wrap">
            {formattedHandle ? <span>{formattedHandle}</span> : null}
            {contextLabel ? <span>{contextLabel}</span> : null}
          </span>
          {activity ? (
            <span className="spark-activity-chip">
              <span className="spark-activity-chip-label">Now</span>
              <strong>{activity}</strong>
            </span>
          ) : null}
        </span>

        {stats.length ? (
          <span className="profile-peek-stat-row">
            {stats.slice(0, 2).map((stat) => (
              <span key={stat.label} className="profile-peek-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </span>
            ))}
          </span>
        ) : null}

        {href ? (
          <Link className="profile-peek-action" href={href}>
            Open profile
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        ) : null}
      </span>
    </span>
  );
}
