"use client";

import { useEffect, useMemo, useState } from "react";

import { buildAuthHref } from "@/lib/auth-flow";
import { InviteLoopCard } from "@/components/invite-loop-card";
import { QuickstartCompactCard } from "@/components/quickstart-compact-card";
import { useSharedWalletState } from "@/components/live-data-hooks";
import type { QuickstartState } from "@/lib/quickstart";
import type { PresenceStatus, PublicProfile } from "@/lib/types";

const presenceOptions: Array<{ value: PresenceStatus; label: string }> = [
  { value: "online", label: "Online" },
  { value: "away", label: "Away" },
  { value: "dnd", label: "Do Not Disturb" },
  { value: "invisible", label: "Invisible" },
];

const durationOptions = [
  { value: "until-cleared", label: "Until cleared" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "24h", label: "24 hours" },
] as const;

function inferDuration(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return "until-cleared" as const;
  }

  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 90 * 60 * 1000) {
    return "1h" as const;
  }
  if (remaining <= 5 * 60 * 60 * 1000) {
    return "4h" as const;
  }

  return "24h" as const;
}

function toExpiry(duration: (typeof durationOptions)[number]["value"]) {
  if (duration === "until-cleared") {
    return null;
  }

  const now = Date.now();
  if (duration === "1h") {
    return new Date(now + 60 * 60 * 1000).toISOString();
  }
  if (duration === "4h") {
    return new Date(now + 4 * 60 * 60 * 1000).toISOString();
  }

  return new Date(now + 24 * 60 * 60 * 1000).toISOString();
}

export function ProfileSettingsPanel({ quickstartState = null }: { quickstartState?: QuickstartState | null }) {
  const walletState = useSharedWalletState();
  const viewer = walletState.viewer;
  const loginHref = buildAuthHref("login", "/app/profile");
  const signupHref = buildAuthHref("signup", "/app/profile");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<PresenceStatus>("online");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState<(typeof durationOptions)[number]["value"]>("until-cleared");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!viewer?.handle) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/profiles/${encodeURIComponent(viewer.handle)}`, { cache: "no-store" });
      if (!response.ok) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      const json = (await response.json()) as { profile?: PublicProfile };
      if (!cancelled && json.profile) {
        setProfile(json.profile);
        setStatus(json.profile.presenceStatus);
        setActivity(json.profile.customActivity?.text ?? "");
        setDuration(inferDuration(json.profile.customActivity?.expiresAt));
        setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [viewer?.handle]);

  const activityPreview = useMemo(() => {
    if (!activity.trim()) {
      return null;
    }

    const selectedDuration = durationOptions.find((option) => option.value === duration);
    return `${activity.trim()} · ${selectedDuration?.label ?? "Until cleared"}`;
  }, [activity, duration]);

  async function savePresence() {
    setSaving(true);
    setNotice(null);

    const response = await fetch("/api/profile/presence", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status,
        customActivityText: activity.trim() || null,
        expiresAt: activity.trim() ? toExpiry(duration) : null,
      }),
    });

    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSaving(false);
      setNotice(json.error ?? "Unable to update profile status.");
      return;
    }

    setSaving(false);
    setNotice("Profile status updated.");
  }

  if (!viewer && !loading) {
    return (
      <div className="glass-panel profile-settings-card">
        <div className="section-stack">
          <span className="eyebrow">Profile</span>
          <h2 className="section-title">Log in to manage your profile</h2>
          <p className="section-copy">
            Public identity, Spark status, and activity only unlock after your account is live.
          </p>
        </div>
        <div className="button-row">
          <a className="action-primary" href={loginHref}>
            Log in
          </a>
          <a className="action-secondary" href={signupHref}>
            Sign up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="section-stack">
      <div className="profile-settings-grid">
        {quickstartState ? (
          <QuickstartCompactCard className="profile-settings-quickstart" state={quickstartState} variant="inline" />
        ) : null}

        <div className="glass-panel profile-settings-card">
          <div className="section-stack">
            <span className="eyebrow">Public profile</span>
            <h2 className="section-title">Identity</h2>
            <p className="section-copy">
              Manage the status that appears across Spark, market threads, and your public profile.
            </p>
          </div>

          <div className="profile-settings-preview">
            <div className="section-stack section-stack-tight">
              <strong>{viewer?.displayName ?? profile?.displayName ?? "PayToCommit member"}</strong>
              <div className="surface-meta surface-meta-wrap">
                <span>@{viewer?.handle ?? profile?.handle ?? "member"}</span>
                <span className={`spark-presence-label spark-presence-${status}`}>{presenceOptions.find((option) => option.value === status)?.label ?? status}</span>
                {activityPreview ? <span>{activityPreview}</span> : null}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <label className="field-stack">
              <span className="field-label">Display name</span>
              <input
                className="form-input"
                defaultValue={viewer?.displayName ?? profile?.displayName ?? ""}
                disabled
              />
            </label>
            <label className="field-stack">
              <span className="field-label">Public handle</span>
              <input
                className="form-input"
                defaultValue={`@${viewer?.handle ?? profile?.handle ?? ""}`}
                disabled
              />
            </label>
          </div>
        </div>

        <div className="glass-panel profile-settings-card">
          <div className="section-stack">
            <span className="eyebrow">Spark status</span>
            <h2 className="section-title">Presence</h2>
            <p className="section-copy">
              Choose how you show up in Spark and market threads.
            </p>
          </div>

          <div className="profile-presence-options">
            {presenceOptions.map((option) => (
              <button
                key={option.value}
                className={`spark-mode-button ${status === option.value ? "is-active" : ""}`}
                onClick={() => setStatus(option.value)}
                type="button"
              >
                <span className={`spark-presence spark-presence-${option.value}`} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="field-stack">
            <span className="field-label">Custom activity</span>
            <input
              className="form-input"
              onChange={(event) => setActivity(event.target.value)}
              placeholder="Training for tomorrow’s 5K"
              type="text"
              value={activity}
            />
          </div>

          <div className="field-stack">
            <span className="field-label">Show activity for</span>
            <div className="profile-duration-options">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  className={`spark-mode-button ${duration === option.value ? "is-active" : ""}`}
                  onClick={() => setDuration(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="button-row">
            <button className="action-primary" disabled={saving || loading} onClick={() => void savePresence()} type="button">
              {saving ? "Saving..." : "Save status"}
            </button>
          </div>

          {notice ? <div className="form-notice">{notice}</div> : null}
        </div>

        <InviteLoopCard
          className="profile-settings-card"
          contactSyncConsent={walletState.contactSyncConsent}
          rewardProgress={walletState.rewardProgress}
        />
      </div>
    </div>
  );
}
