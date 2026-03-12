"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Building2,
  Handshake,
  KeyRound,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import type { EnterpriseApiApplication, GalactusAccessState } from "@/lib/types";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

const requestBands = [
  "Under 10k lookups / month",
  "10k to 100k lookups / month",
  "100k to 1M lookups / month",
  "Over 1M lookups / month",
] as const;

const decisionTypes = [
  "Underwriting and risk review",
  "Hiring and workforce trust",
  "Member or customer eligibility",
  "Vendor or partner review",
  "Operations and compliance",
  "Other",
] as const;

const identityScopeOptions = [
  "Yes, we need legal-name-backed matching when consent is granted",
  "No, consent-scoped reliability only",
] as const;

const launchPathOptions = [
  "Standard enterprise rollout",
  "Strategic partner / flagship contract",
  "Not sure yet",
] as const;

const launchPathCards = {
  "Standard enterprise rollout": {
    title: "Standard rollout",
    summary: "Start with a sandbox project, usage-billed HRS keys, and a normal production review.",
    href: "https://developers.paytocommit.com/sandbox-access",
    ctaLabel: "Open sandbox access",
  },
  "Strategic partner / flagship contract": {
    title: "Strategic partner",
    summary: "Add optional launch pages, case studies, rollout assets, and a negotiated flagship package.",
    href: "https://developers.paytocommit.com/strategic-partners",
    ctaLabel: "Review partner path",
  },
  "Not sure yet": {
    title: "Need guidance",
    summary: "Send the request now and use the platform workspace plus production review docs to pick the right path.",
    href: "https://developers.paytocommit.com/production-review",
    ctaLabel: "Open production review",
  },
} as const;

const nextStepCards = [
  {
    title: "Developer hub",
    summary: "Review HRS API docs, webhook setup, pricing, and the first-call quickstart before production access.",
    href: "https://developers.paytocommit.com/hrs-api",
    label: "Open developer docs",
    icon: BookOpenText,
  },
  {
    title: "Platform workspace",
    summary: "Create organizations, projects, customer views, reports, and audit history once the team signs in.",
    href: "https://platform.paytocommit.com/",
    label: "Open platform workspace",
    icon: LayoutDashboard,
  },
  {
    title: "Workforce rollout",
    summary: "Invite employees by company email, review the access queue, and launch company onboarding from one operator lane.",
    href: "https://platform.paytocommit.com/workforce-rollout",
    label: "Open workforce rollout",
    icon: Building2,
  },
  {
    title: "Launch review",
    summary: "Move through sandbox access, production review, or the optional partner track without losing the request context.",
    href: "https://developers.paytocommit.com/production-review",
    label: "Open launch review",
    icon: Rocket,
  },
] as const;

export function SalesScreen({
  access,
  initialValues,
}: {
  access: GalactusAccessState;
  initialValues?: Partial<EnterpriseApiApplication>;
}) {
  const [form, setForm] = useState<EnterpriseApiApplication>({
    organizationName: initialValues?.organizationName ?? "",
    contactName: initialValues?.contactName ?? "",
    businessEmail: initialValues?.businessEmail ?? "",
    website: initialValues?.website ?? "",
    teamSize: initialValues?.teamSize ?? "",
    monthlyRequestBand: initialValues?.monthlyRequestBand ?? requestBands[1],
    decisionType: initialValues?.decisionType ?? decisionTypes[0],
    needsLegalIdentityMatch: initialValues?.needsLegalIdentityMatch ?? identityScopeOptions[0],
    launchPath: initialValues?.launchPath ?? launchPathOptions[0],
    useCase: initialValues?.useCase ?? "",
    workflowImpact: initialValues?.workflowImpact ?? "",
    consentAcknowledged: initialValues?.consentAcknowledged ?? false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const selectedLaunchPath = launchPathCards[form.launchPath as keyof typeof launchPathCards] ?? launchPathCards["Standard enterprise rollout"];

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("sending");
    setNotice(null);

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setStatus("error");
      setNotice(json.error ?? "Unable to submit the request right now.");
      return;
    }

    setStatus("sent");
    setNotice(json.message ?? "Galactus has your request.");
  }

  return (
    <section className="auth-screen sales-screen">
      <div className="auth-screen-grid sales-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="sales-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="sales-panel-core">
            <div className="section-stack section-stack-tight sales-head">
              <span className="funding-state-chip">Sales</span>
              <h1 className="sales-title">HUMAN RELIABILITY API</h1>
              <p className="sales-subtitle">
                Usage-based access for teams that need consent-scoped reliability history, live trend review, and
                identity-backed matching when that scope is granted. Banks, platforms, employers, operations teams, and
                smaller businesses can all apply through the same path. Consent makes an earned record available for an
                approved opportunity. It does not manufacture a stronger score on its own.
              </p>
            </div>

            <div className="sales-summary-strip">
              <div className="sales-summary-card">
                <ShieldCheck aria-hidden="true" size={18} />
                <strong>Consent-backed legal identity</strong>
                <p>
                  Approved integrations can match a protected reliability record to legal identity only when that
                  identity scope is active.
                </p>
              </div>
              <div className="sales-summary-card">
                <Activity aria-hidden="true" size={18} />
                <strong>Live HRS history</strong>
                <p>
                  Enterprise dashboards can review rises, plateaus, recoveries, and the current standing in one
                  timeline.
                </p>
              </div>
              <div className="sales-summary-card">
                <KeyRound aria-hidden="true" size={18} />
                <strong>Opportunity-ready record</strong>
                <p>
                  Consent makes an earned record usable for approved decisions without turning the API into open people
                  search or inflating the score itself.
                </p>
              </div>
              <div className="sales-summary-card">
                <Building2 aria-hidden="true" size={18} />
                <strong>Standard or flagship rollout</strong>
                <p>
                  Teams can use the normal enterprise path or request an optional strategic partner package with
                  launch assets and case-study support.
                </p>
              </div>
            </div>

            <div className="sales-layout">
              <aside className="sales-overview-card">
                <span className="mono-label">What approved teams can review</span>
                <div className="sales-feature-list">
                  <div className="sales-feature-row">
                    <BadgeCheck aria-hidden="true" size={16} />
                    <span>Consent-backed reliability lookups tied to the correct person</span>
                  </div>
                  <div className="sales-feature-row">
                    <BadgeCheck aria-hidden="true" size={16} />
                    <span>Current HRS, recent trend direction, recovery history, and legal-name-backed matching when identity scope is granted</span>
                  </div>
                  <div className="sales-feature-row">
                    <BadgeCheck aria-hidden="true" size={16} />
                    <span>Organization-level usage review, developer setup, and protected request tracing</span>
                  </div>
                  <div className="sales-feature-row">
                    <BadgeCheck aria-hidden="true" size={16} />
                    <span>Consent controls for customers, workers, applicants, or members before any protected lookup runs</span>
                  </div>
                </div>

                <div className="sales-graph-card">
                  <div className="sales-graph-head">
                    <strong>Protected HRS timeline</strong>
                    <span className="sales-graph-chip">Realtime</span>
                  </div>
                  <p>
                    The enterprise view follows the live reliability curve instead of a flat score. Teams can review
                    rises, plateaus, recoveries, and the current standing the moment the consented record changes.
                  </p>
                  <div className="sales-graph-lines" aria-hidden="true">
                    <span className="sales-graph-line sales-graph-line-a" />
                    <span className="sales-graph-line sales-graph-line-b" />
                    <span className="sales-graph-line sales-graph-line-c" />
                  </div>
                  <div className="sales-graph-legend">
                    <span>Rise</span>
                    <span>Plateau</span>
                    <span>Recovery</span>
                  </div>
                </div>

                <div className="sales-graph-card">
                  <div className="sales-graph-head">
                    <strong>Protected response preview</strong>
                    <span className="sales-graph-chip">Consent scope</span>
                  </div>
                  <p>
                    With identity scope active, approved teams can review the consenting person&apos;s legal name, the
                    current HRS standing, and the live trend history allowed by that consent. Without identity scope,
                    the same request cannot return legal-name-backed matching.
                  </p>
                  <div className="sales-response-preview">
                    <span className="mono-label">legalName</span>
                    <strong>Returned only when identity scope is granted</strong>
                    <span className="mono-label">hrs.current / hrs.trend</span>
                    <strong>Available within the approved consent scope</strong>
                  </div>
                </div>

                <div className="sales-graph-card">
                  <div className="sales-graph-head">
                    <strong>Enterprise setup path</strong>
                    <span className="sales-graph-chip">Three steps</span>
                  </div>
                  <div className="sales-feature-list">
                    <div className="sales-feature-row">
                      <BadgeCheck aria-hidden="true" size={16} />
                      <span>Create the workspace, the first sandbox project, and the first protected key.</span>
                    </div>
                    <div className="sales-feature-row">
                      <BadgeCheck aria-hidden="true" size={16} />
                      <span>Run a consent-scoped lookup, verify webhooks, and confirm billing visibility.</span>
                    </div>
                    <div className="sales-feature-row">
                      <BadgeCheck aria-hidden="true" size={16} />
                      <span>Move through production review, customer drill-down setup, exports, and audit history.</span>
                    </div>
                  </div>
                </div>

                <div className="sales-stat-grid">
                  <div className="sales-stat-card">
                    <Building2 aria-hidden="true" size={16} />
                    <strong>Enterprise profile</strong>
                    <p>Organization, API scope, billing, and consent policy live in one protected account.</p>
                  </div>
                  <div className="sales-stat-card">
                    <Wallet aria-hidden="true" size={16} />
                    <strong>Fair usage billing</strong>
                    <p>Teams pay for approved protected usage, not for idle seats or unused requests.</p>
                  </div>
                </div>

                <div className="sales-graph-card">
                  <div className="sales-graph-head">
                    <strong>Developer and platform hosts</strong>
                    <span className="sales-graph-chip">Ready now</span>
                  </div>
                  <p>
                    Public evaluation can start immediately in the developer portal. The platform workspace takes over
                    once your team is ready to create projects, issue keys, run test calls, and review customer history.
                  </p>
                  <div className="button-row">
                    <Link className="action-secondary" href="https://developers.paytocommit.com">
                      Open developer portal
                    </Link>
                    <Link className="action-secondary" href="https://platform.paytocommit.com">
                      Open platform workspace
                    </Link>
                  </div>
                </div>

                <div className="sales-link-grid">
                  <Link className="sales-link-card" href="https://developers.paytocommit.com/sandbox-access">
                    <BookOpenText aria-hidden="true" size={16} />
                    <strong>Sandbox access</strong>
                    <span>Start with docs, project setup, and the first protected key.</span>
                  </Link>
                  <Link className="sales-link-card" href="https://developers.paytocommit.com/production-review">
                    <Rocket aria-hidden="true" size={16} />
                    <strong>Production review</strong>
                    <span>Move from sandbox to a live, usage-billed rollout with audit coverage.</span>
                  </Link>
                  <Link className="sales-link-card" href="https://developers.paytocommit.com/strategic-partners">
                    <Handshake aria-hidden="true" size={16} />
                    <strong>Strategic partners</strong>
                    <span>Review the optional flagship package for launch assets, case studies, and co-marketing.</span>
                  </Link>
                </div>

                <div className="sales-galactus-card">
                  <span className="mono-label">Galactus</span>
                  <strong>{access.title}</strong>
                  <p>{access.body}</p>
                  {access.countdownLabel ? <p className="detail-text">{access.countdownLabel}</p> : null}
                </div>
              </aside>

              <div className="sales-form-card">
                <div className="section-stack section-stack-tight">
                  <span className="mono-label">Enterprise request</span>
                  <strong>Start the HRS access review</strong>
                  <p className="detail-text">
                    Tell Galactus which decisions this signal should support, whether identity-backed review matters,
                    and how your team will use consent-backed HRS history in real workflows. Public docs stay open and
                    the enterprise request form stays available even before the direct Galactus sales conversation
                    unlocks.
                  </p>
                  <p className="detail-text">
                    Approved keys are usage-based, scoped, and auditable. Identity-backed matching runs only when the
                    customer granted that scope to your named integration.
                  </p>
                </div>

                <div className="sales-summary-strip sales-summary-strip-compact">
                  <div className="sales-summary-card">
                    <strong>Developer docs</strong>
                    <p>Public quickstarts, API reference, webhook docs, and billing reference stay open from the start.</p>
                  </div>
                  <div className="sales-summary-card">
                    <strong>Platform workspace</strong>
                    <p>Create organizations, projects, keys, customer views, exports, and audit history after sign-in.</p>
                  </div>
                  <div className="sales-summary-card">
                    <strong>Strategic partner path</strong>
                    <p>Optional launch pages, case studies, and rollout assets are available only when both sides want them.</p>
                  </div>
                </div>

                <div className="sales-path-grid">
                  {launchPathOptions.map((option) => {
                    const card = launchPathCards[option];
                    const selected = form.launchPath === option;

                    return (
                      <button
                        key={option}
                        className={`sales-path-card${selected ? " is-selected" : ""}`}
                        onClick={() => setForm((current) => ({ ...current, launchPath: option }))}
                        type="button"
                      >
                        <span className="mono-label">{selected ? "Selected path" : "Launch path"}</span>
                        <strong>{card.title}</strong>
                        <p>{card.summary}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="sales-next-grid">
                  {nextStepCards.map((step) => {
                    const Icon = step.icon;

                    return (
                      <Link key={step.title} className="sales-next-card" href={step.href}>
                        <Icon aria-hidden="true" size={16} />
                        <strong>{step.title}</strong>
                        <p>{step.summary}</p>
                        <span>{step.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {status === "sent" ? (
                  <div className="sales-success-card">
                    <BadgeCheck aria-hidden="true" size={18} />
                    <div className="section-stack section-stack-tight">
                      <strong>
                        {access.allowed ? `${selectedLaunchPath.title} request received.` : "Enterprise request received."}
                      </strong>
                      <p>{notice}</p>
                    </div>
                    <div className="button-row">
                      <Link className="action-primary" href={selectedLaunchPath.href}>
                        {selectedLaunchPath.ctaLabel}
                      </Link>
                      <Link className="action-secondary" href="https://platform.paytocommit.com/">
                        Open platform workspace
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {!access.allowed ? (
                  <div className="docs-ai-lock-card">
                    <div className="section-stack section-stack-tight">
                      <strong>{access.body}</strong>
                      <p className="detail-text">
                        Enterprise intake stays open here. Send the request now and keep using the public docs while the
                        direct Galactus sales channel remains protected.
                      </p>
                      {access.countdownLabel ? <p className="detail-text">{access.countdownLabel}</p> : null}
                    </div>
                    <div className="button-row docs-ai-actions">
                      <Link className="action-primary" href={access.ctaHref}>
                        {access.ctaLabel}
                      </Link>
                      <Link className="action-secondary" href="/quickstart">
                        Open quickstart
                      </Link>
                    </div>
                  </div>
                    ) : null}

                  <form className="sales-form-grid" onSubmit={submitRequest}>
                    <label className="auth-input-shell">
                      <input
                        className="auth-input auth-input-stage"
                        onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))}
                        placeholder="Organization name"
                        type="text"
                        value={form.organizationName}
                      />
                    </label>

                    <div className="sales-form-row">
                      <label className="auth-input-shell">
                        <input
                          className="auth-input auth-input-stage"
                          onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
                          placeholder="Primary contact"
                          type="text"
                          value={form.contactName}
                        />
                      </label>
                      <label className="auth-input-shell">
                        <input
                          className="auth-input auth-input-stage"
                          onChange={(event) => setForm((current) => ({ ...current, businessEmail: event.target.value }))}
                          placeholder="Business email"
                          type="email"
                          value={form.businessEmail}
                        />
                      </label>
                    </div>

                    <div className="sales-form-row">
                      <label className="auth-input-shell">
                        <input
                          className="auth-input auth-input-stage"
                          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                          placeholder="Company website"
                          type="url"
                          value={form.website}
                        />
                      </label>
                      <label className="auth-input-shell">
                        <input
                          className="auth-input auth-input-stage"
                          onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))}
                          placeholder="Team size"
                          type="text"
                          value={form.teamSize}
                        />
                      </label>
                    </div>

                    <label className="auth-input-shell">
                      <select
                        className="auth-input auth-input-stage sales-select"
                        onChange={(event) =>
                          setForm((current) => ({ ...current, monthlyRequestBand: event.target.value }))
                        }
                        value={form.monthlyRequestBand}
                      >
                        {requestBands.map((band) => (
                          <option key={band} value={band}>
                            {band}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="sales-form-row">
                      <label className="auth-input-shell">
                        <select
                          className="auth-input auth-input-stage sales-select"
                          onChange={(event) =>
                            setForm((current) => ({ ...current, decisionType: event.target.value }))
                          }
                          value={form.decisionType}
                        >
                          {decisionTypes.map((decisionType) => (
                            <option key={decisionType} value={decisionType}>
                              {decisionType}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="auth-input-shell">
                        <select
                          className="auth-input auth-input-stage sales-select"
                          onChange={(event) =>
                            setForm((current) => ({ ...current, needsLegalIdentityMatch: event.target.value }))
                          }
                          value={form.needsLegalIdentityMatch}
                        >
                          {identityScopeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="sales-path-note">
                      <span className="mono-label">Selected path</span>
                      <strong>{selectedLaunchPath.title}</strong>
                      <p>{selectedLaunchPath.summary}</p>
                    </div>

                    <label className="auth-input-shell sales-textarea-shell">
                      <textarea
                        className="auth-input auth-input-stage sales-textarea"
                        onChange={(event) => setForm((current) => ({ ...current, useCase: event.target.value }))}
                        placeholder={
                          access.allowed
                            ? "Tell Galactus what your team needs to evaluate, which decisions depend on trust, and why Human Reliability API access matters."
                            : "Tell us what your team needs to evaluate, which decisions depend on trust, and why Human Reliability API access matters."
                        }
                        rows={5}
                        value={form.useCase}
                      />
                    </label>

                    <label className="auth-input-shell sales-textarea-shell">
                      <textarea
                        className="auth-input auth-input-stage sales-textarea"
                        onChange={(event) => setForm((current) => ({ ...current, workflowImpact: event.target.value }))}
                        placeholder="Explain how legal-name-backed matching, HRS trend history, exports, or customer drill-down would change approvals, underwriting, hiring, partner review, or other trust-sensitive decisions."
                        rows={4}
                        value={form.workflowImpact}
                      />
                    </label>

                    <label className="sales-consent-row">
                      <input
                        checked={form.consentAcknowledged}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, consentAcknowledged: event.target.checked }))
                        }
                        type="checkbox"
                      />
                      <span>
                        I understand protected reliability access can include legal-name-backed matching only when that
                        identity scope is active, and every protected request remains scoped, logged, and billed by
                        usage.
                      </span>
                    </label>

                    <button className="action-primary auth-submit-stage" disabled={status === "sending"} type="submit">
                      <span>
                        {status === "sending"
                          ? "Sending..."
                          : access.allowed
                            ? "Submit request to Galactus"
                            : "Submit enterprise request"}
                      </span>
                      <ArrowRight aria-hidden="true" size={16} />
                    </button>
                  </form>
                  </>
                )}

                {notice && status !== "sent" ? <div className="form-notice">{notice}</div> : null}
              </div>
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
