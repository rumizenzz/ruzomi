import Link from "next/link";
import { ArrowRight, Bot, Circle, Landmark, MailCheck, Search, Wallet } from "lucide-react";

import type { QuickstartState } from "@/lib/quickstart";

function CompactStepIcon({ index, status }: { index: number; status: "locked" | "current" | "completed" }) {
  if (index === 0) {
    return <MailCheck aria-hidden="true" size={16} />;
  }

  if (index === 1) {
    return <Search aria-hidden="true" size={16} />;
  }

  if (index === 2) {
    return <Wallet aria-hidden="true" size={16} />;
  }

  if (index === 3) {
    return <Landmark aria-hidden="true" size={16} />;
  }

  if (status === "completed") {
    return <Bot aria-hidden="true" size={16} />;
  }

  if (status === "current") {
    return <ArrowRight aria-hidden="true" size={16} />;
  }

  return <Circle aria-hidden="true" size={16} />;
}

export function QuickstartCompactCard({
  state,
  className = "",
  variant = "default",
}: {
  state: QuickstartState;
  className?: string;
  variant?: "default" | "inline";
}) {
  const progress = Math.max(12, Math.round((state.completedCount / state.totalCount) * 100));
  const fundStep = state.steps.find((step) => step.id === "fund") ?? state.steps[2];
  const nextStep = state.nextStep;

  if (variant === "inline") {
    return (
      <div className={`glass-panel quickstart-compact-card is-inline ${className}`.trim()}>
        <div className="quickstart-compact-head">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Quickstart</span>
            <strong>{state.completedCount === state.totalCount ? "Your guide is complete" : "Keep your first path moving"}</strong>
            <p className="detail-text">
              {state.completedCount}/{state.totalCount} complete. Next: {nextStep.title}
            </p>
          </div>
          <div className="quickstart-compact-badge">
            <div aria-hidden="true" className="quickstart-compact-badge-stack">
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-back" />
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-mid" />
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-front">
                <span className="quickstart-compact-cash-band" />
                <span className="quickstart-compact-cash-glow" />
              </span>
            </div>
            <span>{state.completedCount === state.totalCount ? "Guide complete" : "First $10 path"}</span>
          </div>
        </div>

        <div className="quickstart-compact-progress" aria-hidden="true">
          <span className="quickstart-compact-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quickstart-inline-grid">
          <div className="quickstart-inline-step is-completed">
            <div className="quickstart-inline-step-top">
              <span className="quickstart-compact-step-icon">
                <CompactStepIcon index={0} status="completed" />
              </span>
              <span className="mono-label">Account</span>
            </div>
            <strong>Check your email</strong>
            <p className="detail-text">Browse first. Identity waits until you fund or place a live stake.</p>
          </div>

          <div className={`quickstart-inline-step is-${fundStep.status} is-fund`.trim()}>
            <div className="quickstart-inline-step-top">
              <span className="quickstart-compact-step-icon">
                <CompactStepIcon index={2} status={fundStep.status} />
              </span>
              <div aria-hidden="true" className="quickstart-compact-cash-stack">
                <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-back" />
                <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-mid" />
                <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-front">
                  <span className="quickstart-compact-cash-band" />
                  <span className="quickstart-compact-cash-glow" />
                </span>
                <span className="quickstart-compact-cash-chip">$10</span>
              </div>
            </div>
            <strong>{fundStep.title}</strong>
            <p className="detail-text">Add your first $10 when you are ready to fund or lock a stake.</p>
          </div>

          <div className={`quickstart-inline-step is-${nextStep.status}`.trim()}>
            <div className="quickstart-inline-step-top">
              <span className="quickstart-compact-step-icon">
                <CompactStepIcon index={state.steps.findIndex((step) => step.id === nextStep.id)} status={nextStep.status} />
              </span>
              <span className="mono-label">Next</span>
            </div>
            <strong>{nextStep.title}</strong>
            <p className="detail-text">{nextStep.description}</p>
          </div>
        </div>

        <div className="quickstart-social-prompt">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Ruzomi</span>
            <strong>Post your first commitment on Ruzomi</strong>
            <p className="detail-text">Say it in your own words, keep it natural, and make the commitment visible to the people following your lane.</p>
          </div>
          <Link className="action-secondary quickstart-social-link" href="/">
            Open Ruzomi
          </Link>
        </div>

        <div className="quickstart-compact-footer">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Galactus window</span>
            <strong>{state.galactusAccess.title}</strong>
            <p className="detail-text">{state.galactusAccess.countdownLabel ?? state.galactusAccess.body}</p>
          </div>
          <div className="button-row quickstart-compact-actions">
            <Link className="action-primary" href={nextStep.href}>
              {nextStep.actionLabel}
            </Link>
            <Link className="action-secondary" href="/quickstart">
              Open quickstart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-panel quickstart-compact-card ${className}`.trim()}>
      <div className="quickstart-compact-head">
        <div className="section-stack section-stack-tight">
          <span className="mono-label">Quickstart</span>
          <strong>{state.completedCount === state.totalCount ? "All set" : "Do these next"}</strong>
          <p className="detail-text">
            {state.completedCount}/{state.totalCount} complete. Next: {state.nextStep.title}
          </p>
        </div>
        <div className="quickstart-compact-badge">
          {state.completedCount !== state.totalCount ? (
            <div aria-hidden="true" className="quickstart-compact-badge-stack">
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-back" />
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-mid" />
              <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-front">
                <span className="quickstart-compact-cash-band" />
                <span className="quickstart-compact-cash-glow" />
              </span>
            </div>
          ) : null}
          <span>{state.completedCount === state.totalCount ? "Galactus active" : "First $10 path"}</span>
        </div>
      </div>

      <div className="quickstart-compact-progress" aria-hidden="true">
        <span className="quickstart-compact-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quickstart-compact-step-grid">
        {state.steps.map((step, index) => (
          <div key={step.id} className={`quickstart-compact-step is-${step.status} ${step.id === "fund" ? "is-fund" : ""}`.trim()}>
            <div className="quickstart-compact-step-top">
              <span className="quickstart-compact-step-icon">
                <CompactStepIcon index={index} status={step.status} />
              </span>
              {step.id === "fund" ? (
                <div aria-hidden="true" className="quickstart-compact-cash-stack">
                  <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-back" />
                  <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-mid" />
                  <span className="quickstart-compact-cash-bundle quickstart-compact-cash-bundle-front">
                    <span className="quickstart-compact-cash-band" />
                    <span className="quickstart-compact-cash-glow" />
                  </span>
                  <span className="quickstart-compact-cash-chip">$10</span>
                </div>
              ) : null}
            </div>
            <div className="section-stack section-stack-tight">
              <span className="mono-label">{step.label}</span>
              <strong>{step.title}</strong>
              {step.id === "fund" ? <p className="detail-text quickstart-compact-fund-note">Deposit $10 to start staking.</p> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="quickstart-social-prompt">
        <div className="section-stack section-stack-tight">
          <span className="mono-label">Ruzomi</span>
          <strong>Post your first commitment on Ruzomi</strong>
          <p className="detail-text">Keep the post in your own voice. The point is to make the commitment feel social, not scripted.</p>
        </div>
        <Link className="action-secondary quickstart-social-link" href="/">
          Open Ruzomi
        </Link>
      </div>

      <div className="quickstart-compact-footer">
        <div className="section-stack section-stack-tight">
          <span className="mono-label">Galactus window</span>
          <strong>{state.galactusAccess.title}</strong>
          <p className="detail-text">{state.galactusAccess.countdownLabel ?? state.galactusAccess.body}</p>
          <p className="detail-text quickstart-compact-note">
            Identity starts only when you fund the wallet or place a live stake.
          </p>
        </div>
        <div className="button-row quickstart-compact-actions">
          <Link className="action-primary" href={state.nextStep.href}>
            {state.nextStep.actionLabel}
          </Link>
          <Link className="action-secondary" href="/quickstart">
            Open quickstart
          </Link>
        </div>
      </div>
    </div>
  );
}
