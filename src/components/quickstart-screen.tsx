import Link from "next/link";
import { ArrowRight, BadgeCheck, Circle, LockKeyhole, Wallet } from "lucide-react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import type { GalactusAccessState, QuickstartStep } from "@/lib/types";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

function StepIcon({ status }: { status: QuickstartStep["status"] }) {
  if (status === "completed") {
    return <BadgeCheck aria-hidden="true" size={18} />;
  }

  if (status === "current") {
    return <ArrowRight aria-hidden="true" size={18} />;
  }

  return <Circle aria-hidden="true" size={18} />;
}

function CashStackVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`quickstart-cash-stack ${compact ? "is-compact" : ""}`.trim()}>
      <span className="quickstart-cash-bundle quickstart-cash-bundle-back" />
      <span className="quickstart-cash-bundle quickstart-cash-bundle-mid" />
      <span className="quickstart-cash-bundle quickstart-cash-bundle-front">
        <span className="quickstart-cash-band" />
        <span className="quickstart-cash-glow" />
      </span>
      <span className="quickstart-cash-chip">$10</span>
    </div>
  );
}

export function QuickstartScreen({
  title,
  subtitle,
  steps,
  galactusAccess,
  enterpriseSteps,
}: {
  title: string;
  subtitle: string;
  steps: QuickstartStep[];
  galactusAccess: GalactusAccessState;
  enterpriseSteps: QuickstartStep[];
}) {
  return (
    <section className="auth-screen quickstart-screen">
      <div className="auth-screen-grid quickstart-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="quickstart-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="quickstart-panel-core">
            <div className="section-stack section-stack-tight quickstart-head">
              <span className="funding-state-chip">Quickstart</span>
              <h1 className="quickstart-title">{title}</h1>
              <p className="quickstart-subtitle">{subtitle}</p>
            </div>

            <div className="quickstart-summary-strip">
              <div className="quickstart-summary-card is-cash">
                <div className="quickstart-summary-card-head">
                  <span className="quickstart-summary-icon-shell">
                    <Wallet aria-hidden="true" size={18} />
                  </span>
                  <CashStackVisual />
                </div>
                <strong>Deposit your first $10</strong>
                <p>Create the account first. Identity starts only when you add funds or place the first live stake.</p>
              </div>
              <div className="quickstart-summary-card">
                <BadgeCheck aria-hidden="true" size={18} />
                <strong>Finish one commitment</strong>
                <p>Submit proof on time, close one verified result, and unlock the next layer.</p>
              </div>
              <div className="quickstart-summary-card">
                <LockKeyhole aria-hidden="true" size={18} />
                <strong>Galactus window</strong>
                <p>{galactusAccess.allowed ? galactusAccess.countdownLabel ?? "Access is active." : galactusAccess.body}</p>
              </div>
            </div>

            <div className="quickstart-layout">
              <section className="quickstart-track">
                <div className="section-stack section-stack-tight">
                  <span className="mono-label">Individual path</span>
                  <strong>Start here first</strong>
                </div>

                <div className="quickstart-step-list">
                  {steps.map((step, index) => (
                    <div key={step.id} className={`quickstart-step-card is-${step.status}`}>
                      <div className="quickstart-step-index">{index + 1}</div>
                      <div className="quickstart-step-body">
                        <div className="quickstart-step-title-row">
                          <span className="quickstart-step-icon">
                            <StepIcon status={step.status} />
                          </span>
                          <div className="section-stack section-stack-tight">
                            <span className="mono-label">{step.label}</span>
                            <strong>{step.title}</strong>
                          </div>
                          {step.id === "fund" ? <CashStackVisual compact /> : null}
                        </div>
                        <p>{step.description}</p>
                        <Link className="action-secondary quickstart-action" href={step.href}>
                          {step.actionLabel}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="quickstart-side">
                <div className="quickstart-side-card">
                  <span className="mono-label">Galactus access</span>
                  <strong>{galactusAccess.title}</strong>
                  <p>{galactusAccess.body}</p>
                  {galactusAccess.countdownLabel ? <p className="detail-text">{galactusAccess.countdownLabel}</p> : null}
                  <div className="button-row docs-ai-actions">
                    <Link className="action-primary" href={galactusAccess.ctaHref}>
                      {galactusAccess.ctaLabel}
                    </Link>
                    <Link className="action-secondary" href="/docs/human-reliability-api">
                      Open reliability docs
                    </Link>
                  </div>
                </div>

                <div className="quickstart-side-card">
                  <span className="mono-label">Enterprise path</span>
                  <strong>Set up enterprise access</strong>
                  <div className="quickstart-mini-list">
                    {enterpriseSteps.map((step) => (
                      <div key={step.id} className={`quickstart-mini-step is-${step.status}`}>
                        <StepIcon status={step.status} />
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link className="action-secondary quickstart-action" href="/sales">
                    Open sales
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <div className="funding-bottom-mark" aria-hidden="true">
          <BrandMark />
        </div>

        <div className="docs-experience-footer">
          {footerLinks.map((link) => (
            <Link key={link.href} className="auth-footer-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
