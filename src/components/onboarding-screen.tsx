"use client";

import Link from "next/link";
import { BellRing, Compass, Layers3, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GlassPanel } from "@/components/surfaces";

const storageKey = "paytocommit:onboarding-v1";

const categoryOptions = [
  { id: "fitness", label: "Fitness", detail: "Runs, lifting, recovery, and daily discipline." },
  { id: "work", label: "Work", detail: "Shipping, deep work, sales, and close deadlines." },
  { id: "learning", label: "Learning", detail: "Reading, study sessions, and skill sprints." },
  { id: "home", label: "Home", detail: "Cleaning, routines, and household resets." },
  { id: "finance", label: "Finance", detail: "Savings, spending, and money discipline." },
  { id: "social", label: "Social", detail: "Calls, outreach, and relationship habits." },
  { id: "health", label: "Health", detail: "Sleep, food logs, medication, and recovery." },
  { id: "enterprise", label: "Enterprise", detail: "HRS, team reliability, and API access." },
] as const;

const discoveryOptions = [
  { id: "live-now", label: "Show live markets first" },
  { id: "fractal", label: "Show Fractal Markets" },
  { id: "deadline", label: "Prioritize shorter deadlines" },
  { id: "spark", label: "Show Ruzomi and Spark activity" },
  { id: "results", label: "Highlight verified finishes" },
] as const;

const notificationOptions = [
  { id: "opens", label: "Market opens" },
  { id: "deadlines", label: "Proof deadlines" },
  { id: "spark", label: "Spark replies and reactions" },
] as const;

type CategoryId = (typeof categoryOptions)[number]["id"];
type DiscoveryId = (typeof discoveryOptions)[number]["id"];
type NotificationId = (typeof notificationOptions)[number]["id"];

interface OnboardingState {
  displayName: string;
  timezone: string;
  interests: CategoryId[];
  discovery: DiscoveryId[];
  notifications: NotificationId[];
}

const defaultState: OnboardingState = {
  displayName: "",
  timezone: "America/New_York",
  interests: ["fitness", "work", "learning"],
  discovery: ["live-now", "fractal", "spark"],
  notifications: ["opens", "deadlines"],
};

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export function OnboardingScreen() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(() => ({
    ...defaultState,
    timezone:
      typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || defaultState.timezone : defaultState.timezone,
  }));
  const [saved, setSaved] = useState(false);

  const highlightedCategories = useMemo(
    () => categoryOptions.filter((option) => state.interests.includes(option.id)),
    [state.interests],
  );

  function updateState(next: Partial<OnboardingState>) {
    setSaved(false);
    setState((current) => ({ ...current, ...next }));
  }

  function persistPreferences() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Keep the flow moving if storage is unavailable.
    }

    setSaved(true);
  }

  function saveAndContinue() {
    persistPreferences();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="section-stack onboarding-shell">
      <div className="section-stack onboarding-intro">
        <span className="eyebrow">Onboarding</span>
        <h1 className="hero-title onboarding-title">Pick what you want to follow first.</h1>
        <p className="hero-copy onboarding-copy">
          Set your categories, save how you want the board to behave, and keep signup light. Identity starts only when
          you fund the wallet or place a live stake.
        </p>
      </div>

      <div className="onboarding-layout">
        <GlassPanel className="onboarding-card onboarding-main-card">
          <div className="onboarding-header-row">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Your first view</span>
              <strong className="section-title">Build your board</strong>
              <p className="detail-text">
                These picks shape the Commitment Board, the markets that lead your rail, and the categories that stay
                closest to your search field.
              </p>
            </div>

            <div className="onboarding-state-chip">
              <Sparkles aria-hidden="true" size={16} />
              <span>Identity stays out of the way for now</span>
            </div>
          </div>

          <div className="form-grid onboarding-form-grid">
            <label className="field-stack">
              <span className="field-label">Display name</span>
              <input
                className="form-input"
                onChange={(event) => updateState({ displayName: event.target.value })}
                placeholder="How your name should appear across the board"
                value={state.displayName}
              />
            </label>

            <label className="field-stack">
              <span className="field-label">Timezone</span>
              <input
                className="form-input"
                onChange={(event) => updateState({ timezone: event.target.value })}
                value={state.timezone}
              />
            </label>
          </div>

          <div className="section-stack onboarding-section">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Categories</span>
              <strong>Choose the markets you want near the top.</strong>
            </div>

            <div className="onboarding-choice-grid">
              {categoryOptions.map((option) => {
                const active = state.interests.includes(option.id);

                return (
                  <button
                    key={option.id}
                    className={`onboarding-choice-card ${active ? "is-active" : ""}`}
                    onClick={() => updateState({ interests: toggleValue(state.interests, option.id) })}
                    type="button"
                  >
                    <div className="section-stack section-stack-tight">
                      <div className="row-between">
                        <strong>{option.label}</strong>
                        <span className="status-pill" data-tone={active ? "live" : "settling"}>
                          {active ? "Following" : "Available"}
                        </span>
                      </div>
                      <p className="detail-text">{option.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="onboarding-split-grid">
            <section className="section-stack onboarding-section">
              <div className="section-stack section-stack-tight">
                <span className="mono-label">Discovery</span>
                <strong>Choose how the board should scan.</strong>
              </div>

              <div className="onboarding-pill-grid">
                {discoveryOptions.map((option) => {
                  const active = state.discovery.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      className={`spark-mode-button onboarding-pill ${active ? "is-active" : ""}`}
                      onClick={() => updateState({ discovery: toggleValue(state.discovery, option.id) })}
                      type="button"
                    >
                      <Compass aria-hidden="true" size={16} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="section-stack onboarding-section">
              <div className="section-stack section-stack-tight">
                <span className="mono-label">Notifications</span>
                <strong>Choose which prompts should stay close.</strong>
              </div>

              <div className="onboarding-pill-grid">
                {notificationOptions.map((option) => {
                  const active = state.notifications.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      className={`spark-mode-button onboarding-pill ${active ? "is-active" : ""}`}
                      onClick={() => updateState({ notifications: toggleValue(state.notifications, option.id) })}
                      type="button"
                    >
                      <BellRing aria-hidden="true" size={16} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="button-row onboarding-actions">
            <button className="action-primary" onClick={saveAndContinue} type="button">
              Save and open Commitment Board
            </button>
            <button className="action-secondary" onClick={persistPreferences} type="button">
              Save for later
            </button>
            <Link className="action-secondary" href="/app">
              Open My Portfolio
            </Link>
          </div>

          {saved ? <div className="form-notice">Preferences saved. You can keep browsing before identity starts.</div> : null}
        </GlassPanel>

        <div className="onboarding-side-stack">
          <GlassPanel className="onboarding-card onboarding-preview-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Board preview</span>
              <strong>What moves up first</strong>
            </div>

            <div className="onboarding-preview-list">
              {highlightedCategories.map((option) => (
                <div key={option.id} className="summary-card onboarding-preview-item">
                  <span className="mono-label">{option.label}</span>
                  <strong>{option.detail}</strong>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="onboarding-card onboarding-preview-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Next unlocks</span>
              <strong>What stays ahead</strong>
            </div>

            <div className="compact-list onboarding-rule-list">
              <div className="timeline-item onboarding-rule-item">
                <Layers3 aria-hidden="true" size={18} />
                <div className="section-stack section-stack-tight">
                  <strong>Search stays open now</strong>
                  <p className="detail-text">Read markets, open Fractal Markets, and scan pulse graphs without any identity step.</p>
                </div>
              </div>
              <div className="timeline-item onboarding-rule-item">
                <Wallet aria-hidden="true" size={18} />
                <div className="section-stack section-stack-tight">
                  <strong>Funding starts verification</strong>
                  <p className="detail-text">The first identity check appears only when you move into funding or a live stake.</p>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
