"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buildAuthHref } from "@/lib/auth-flow";
import { GlassPanel } from "@/components/surfaces";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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

export function SparkSidePanel() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<PresenceStatus>("online");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState<(typeof durationOptions)[number]["value"]>("until-cleared");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const loginHref = buildAuthHref("login", pathname);
  const signupHref = buildAuthHref("signup", pathname);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const browserClient = supabase;

    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await browserClient.auth.getUser();

      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(user));
      setAuthReady(true);

      if (!user) {
        setProfile(null);
        setStatus("online");
        setActivity("");
        setDuration("until-cleared");
        return;
      }

      const response = await fetch("/api/profile/me", { cache: "no-store" });
      if (!response.ok) {
        setNotice("Unable to load your Spark profile right now.");
        return;
      }

      const json = (await response.json()) as { profile?: PublicProfile | null };
      if (!mounted || !json.profile) {
        return;
      }

      setProfile(json.profile);
      setStatus(json.profile.presenceStatus);
      setActivity(json.profile.customActivity?.text ?? "");
      setDuration(inferDuration(json.profile.customActivity?.expiresAt));
    }

    void loadProfile();

    const { data } = browserClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setAuthReady(true);
      if (!session?.user) {
        setProfile(null);
        setStatus("online");
        setActivity("");
        setDuration("until-cleared");
      } else {
        void loadProfile();
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

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
      setNotice(json.error ?? "Unable to update Spark status.");
      return;
    }

    setSaving(false);
    setNotice("Spark status updated.");
  }

  if (!authReady) {
    return (
      <GlassPanel className="spark-side-panel-card">
        <div className="section-stack">
          <span className="eyebrow">Spark</span>
          <h2 className="section-title">Checking access</h2>
          <p className="section-copy">Loading your Spark status and account access.</p>
        </div>
      </GlassPanel>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="section-stack spark-side-panel-stack">
        <GlassPanel className="spark-side-panel-card">
          <div className="section-stack">
            <span className="eyebrow">Spark access</span>
            <h2 className="section-title">Log in to join the feed</h2>
            <p className="section-copy">
              Posting, replies, reactions, GIFs, polls, and market ideas stay locked until your account is live.
            </p>
          </div>

          <div className="button-row">
            <Link className="action-primary" href={loginHref}>
              Log in
            </Link>
            <Link className="action-secondary" href={signupHref}>
              Sign up
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="spark-side-panel-card">
          <div className="section-stack">
            <span className="eyebrow">Spark</span>
            <h2 className="section-title">What moves here</h2>
          </div>
          <div className="timeline-list timeline-list-tight">
            <div className="timeline-item">
              <div className="timeline-index">1</div>
              <div className="section-stack">
                <strong>Post live progress</strong>
                <p className="detail-text">Updates, closes, and market demand stay visible across every open market.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">2</div>
              <div className="section-stack">
                <strong>Search GIFs natively</strong>
                <p className="detail-text">Search, preview, and drop GIFs directly into Spark without leaving the thread.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-index">3</div>
              <div className="section-stack">
                <strong>Draft new markets</strong>
                <p className="detail-text">Market ideas and polls can move straight into a drafted market when demand is clear.</p>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="section-stack spark-side-panel-stack">
      <GlassPanel className="spark-side-panel-card">
        <div className="section-stack">
          <span className="eyebrow">Your Spark status</span>
          <h2 className="section-title">{profile?.displayName ?? "PayToCommit member"}</h2>
          <div className="surface-meta surface-meta-wrap">
            <span>@{profile?.handle ?? "member"}</span>
            <span className={`spark-presence-label spark-presence-${status}`}>{presenceOptions.find((option) => option.value === status)?.label ?? status}</span>
          </div>
          {profile?.customActivity?.text || activity.trim() ? (
            <div className="spark-activity-chip">
              <span className="spark-activity-chip-label">Now</span>
              <strong>{activity.trim() || profile?.customActivity?.text}</strong>
            </div>
          ) : null}
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

        <label className="field-stack">
          <span className="field-label">Custom activity</span>
          <input
            className="form-input"
            onChange={(event) => setActivity(event.target.value)}
            placeholder="Training for tomorrow’s 5K"
            type="text"
            value={activity}
          />
        </label>

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

        <div className="button-row">
          <button className="action-primary" disabled={saving} onClick={() => void savePresence()} type="button">
            {saving ? "Saving..." : "Save status"}
          </button>
          <Link className="action-secondary" href="/app/profile">
            Full profile
          </Link>
        </div>

        {notice ? <div className="form-notice">{notice}</div> : null}
      </GlassPanel>

      <GlassPanel className="spark-side-panel-card">
        <div className="section-stack">
          <span className="eyebrow">Market ideas</span>
          <h2 className="section-title">Draft from Spark</h2>
          <p className="section-copy">
            Post a market idea, let the feed react to it, then move it into a draft when it is ready to open.
          </p>
        </div>
        <div className="timeline-list timeline-list-tight">
          <div className="timeline-item">
            <div className="timeline-index">1</div>
            <div className="section-stack">
              <strong>Post demand</strong>
              <p className="detail-text">Use a market idea post when you want the feed to shape a new market before it opens.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">2</div>
            <div className="section-stack">
              <strong>Collect reactions</strong>
              <p className="detail-text">Polls, replies, and reactions show whether the idea has real momentum.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">3</div>
            <div className="section-stack">
              <strong>Open when ready</strong>
              <p className="detail-text">Draft first. Nothing opens until you confirm it.</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
