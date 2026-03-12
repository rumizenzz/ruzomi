"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { BookOpenText, Building2, LifeBuoy, MessagesSquare, Search, Wrench } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { getHelpArticleBySlug, getHelpSearchResults, helpArticles, helpSections } from "@/lib/help-content";
import type { GalactusAccessState } from "@/lib/types";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

const laneIcons = {
  guides: BookOpenText,
  troubleshooting: Wrench,
  contact: LifeBuoy,
  community: MessagesSquare,
  enterprise: Building2,
} as const;

export function HelpCenterScreen({
  initialArticleSlug,
  initialQuery = "",
  supportAccess,
}: {
  initialArticleSlug?: string;
  initialQuery?: string;
  supportAccess: GalactusAccessState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [selectedSlug, setSelectedSlug] = useState(initialArticleSlug ?? helpArticles[0]?.slug ?? "account-access");
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => getHelpSearchResults(deferredQuery), [deferredQuery]);
  const normalizedQuery = deferredQuery.trim();
  const sectionMatchCounts = useMemo(() => {
    return results.reduce<Record<string, number>>((counts, result) => {
      counts[result.sectionId] = (counts[result.sectionId] ?? 0) + 1;
      return counts;
    }, {});
  }, [results]);
  const totalArticleCount = helpArticles.length;
  const hasResults = results.length > 0;
  const activeSlug = useMemo(() => {
    if (!results.length) {
      return selectedSlug;
    }

    if (results.some((result) => result.slug === selectedSlug)) {
      return selectedSlug;
    }

    return results[0]?.slug ?? selectedSlug;
  }, [results, selectedSlug]);

  const activeArticle = useMemo(() => {
    return getHelpArticleBySlug(activeSlug);
  }, [activeSlug]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (normalizedQuery) {
      nextParams.set("q", normalizedQuery);
    }

    if (activeArticle.slug) {
      nextParams.set("article", activeArticle.slug);
    }

    const nextQuery = nextParams.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextHref, { scroll: false });
  }, [activeArticle.slug, normalizedQuery, pathname, router]);

  async function submitSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSupportStatus("sending");
    setSupportNotice(null);

    const response = await fetch("/api/support", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: supportName,
        email: supportEmail,
        message: supportMessage,
      }),
    });

    const json = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setSupportStatus("error");
      setSupportNotice(json.error ?? "Unable to send the request right now.");
      return;
    }

    setSupportStatus("sent");
    setSupportNotice(json.message ?? "Galactus has your support request.");
    setSupportMessage("");
  }

  return (
    <section className="auth-screen help-center-screen">
      <div className="auth-screen-grid help-center-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="help-center-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="help-center-panel-core">
            <div className="section-stack section-stack-tight help-center-head">
              <span className="funding-state-chip">Help</span>
              <h1 className="help-center-title">HELP CENTER</h1>
              <p className="help-center-subtitle">
                Search account access, funding, proof windows, payouts, and developer questions in one place.
              </p>
            </div>

            <label className="docs-experience-search help-center-search">
              <Search aria-hidden="true" size={18} />
              <input
                aria-label="Search help center"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search account access, funding, proof, and developer help..."
                type="search"
                value={query}
              />
            </label>

                <div className="help-center-summary-strip">
                <div className="help-center-summary-card">
                  <span className="mono-label">Live search</span>
                  <strong>{normalizedQuery ? `${results.length} matches` : `${totalArticleCount} articles`}</strong>
                  <p>Results update while you type and keep the current article in the URL.</p>
                </div>
                <div className="help-center-summary-card">
                  <span className="mono-label">Fast paths</span>
                  <strong>Account, funding, proof, developer</strong>
                  <p>Use the lane cards below to jump into the right help track first.</p>
                </div>
                <div className="help-center-summary-card">
                  <span className="mono-label">Direct routes</span>
                  <strong>Reset, docs, developers, platform</strong>
                  <p>Recovery, identity guidance, the public developer hub, and the signed-in workspace all stay one click away.</p>
                </div>
            </div>

            <div className="help-center-lanes">
              {helpSections.map((section) => {
                const Icon = laneIcons[section.id as keyof typeof laneIcons] ?? BookOpenText;
                const firstArticle = helpArticles.find((article) => article.sectionId === section.id);

                return (
                  <button
                    key={section.id}
                    className="help-center-lane"
                    onClick={() => setSelectedSlug(firstArticle?.slug ?? selectedSlug)}
                    type="button"
                  >
                    <span className="help-center-lane-icon">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <span className="section-stack section-stack-tight">
                      <strong>
                        {section.title}
                        <span className="help-center-count-pill">
                          {normalizedQuery ? `${sectionMatchCounts[section.id] ?? 0} matches` : "Open"}
                        </span>
                      </strong>
                      <span>{section.summary}</span>
                      <p>{section.description}</p>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="help-center-layout">
              <aside className="help-center-results">
                <div className="section-stack section-stack-tight">
                  <span className="mono-label">Results</span>
                  <strong>{normalizedQuery ? `${results.length} matches` : `${totalArticleCount} articles`}</strong>
                  <p className="detail-text">Search updates live and keeps the selected article in the URL.</p>
                </div>
                <div className="help-center-result-list">
                  {hasResults ? (
                    results.map((result) => (
                      <button
                        key={`${result.slug}-${result.match}`}
                        className={`help-center-result ${activeArticle.slug === result.slug ? "is-active" : ""}`}
                        onClick={() => setSelectedSlug(result.slug)}
                        type="button"
                      >
                        <span className="mono-label">
                          {helpSections.find((section) => section.id === result.sectionId)?.title ?? "Help"}
                        </span>
                        <strong>{result.title}</strong>
                        <p>{result.match}</p>
                      </button>
                    ))
                  ) : (
                    <div className="help-center-empty">
                      <span className="mono-label">No matches</span>
                      <strong>Try a simpler search or pick a lane above.</strong>
                      <p>Help search checks article titles, summaries, keywords, and article copy.</p>
                      <button className="action-secondary" onClick={() => setQuery("")} type="button">
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </aside>

              <article className="help-center-article">
                {hasResults ? (
                  <>
                    <div className="section-stack section-stack-tight">
                      <span className="eyebrow">
                        {helpSections.find((section) => section.id === activeArticle.sectionId)?.title ?? "Help"}
                      </span>
                      <h2 className="help-center-article-title">{activeArticle.title}</h2>
                      <p className="section-copy">{activeArticle.summary}</p>
                    </div>

                    <div className="section-stack help-center-article-body">
                      {activeArticle.body.map((paragraph) => (
                        <p key={paragraph} className="section-copy">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="help-center-links">
                      <Link className="docs-experience-result" href="/login">
                        <strong>Account access</strong>
                        <p>Go to login, signup, or password recovery.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/docs/knowledge-base">
                        <strong>Knowledge base</strong>
                        <p>Open the guide library for first deposit, proof timing, results, and social channels.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://developers.paytocommit.com">
                        <strong>Developer hub</strong>
                        <p>Open quickstarts, HRS API reference, webhooks, pricing, and sandbox access.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://platform.paytocommit.com">
                        <strong>Platform workspace</strong>
                        <p>Open organizations, projects, customer views, reports, billing, and audit history.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://platform.paytocommit.com/workforce-rollout">
                        <strong>Employee rollout</strong>
                        <p>Invite employees by company email, review access requests, and launch company onboarding.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/docs/human-reliability-api">
                        <strong>Developer and consent questions</strong>
                        <p>Review the Human Reliability API, consent scope, and enterprise usage billing.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/sales">
                        <strong>Enterprise access</strong>
                        <p>Open the HRS access request, usage bands, and legal-identity matching requirements.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/app/verify">
                        <strong>Funding and identity</strong>
                        <p>Open identity verification and continue into funding once the account is ready.</p>
                      </Link>
                    </div>

                    <div className="help-center-support-card glass-panel">
                      <div className="section-stack section-stack-tight">
                        <span className="mono-label">Support</span>
                        <strong>Contact Galactus</strong>
                        <p className="detail-text">
                          Public help articles stay open for everyone. Direct Galactus conversation follows the same
                          protected access rule used by Docs AI, Generate, and the live sales surface, but the support
                          case form below stays available.
                        </p>
                      </div>

                      {supportStatus === "sent" ? (
                        <div className="sales-success-card">
                          <div className="section-stack section-stack-tight">
                            <strong>{supportAccess.allowed ? "Galactus received the request." : "Support case opened."}</strong>
                            <p>{supportNotice}</p>
                          </div>
                          <div className="button-row docs-ai-actions">
                            <button className="action-primary" onClick={() => setSupportStatus("idle")} type="button">
                              Send another request
                            </button>
                            <Link className="action-secondary" href="/docs/knowledge-base">
                              Open knowledge base
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!supportAccess.allowed ? (
                        <div className="docs-ai-lock-card">
                          <div className="section-stack section-stack-tight">
                            <strong>{supportAccess.body}</strong>
                            <p className="detail-text">
                              Critical help still stays reachable here. Send the case now and the request will open even
                              before the direct Galactus channel unlocks.
                            </p>
                            {supportAccess.countdownLabel ? <p className="detail-text">{supportAccess.countdownLabel}</p> : null}
                          </div>
                          <div className="button-row docs-ai-actions">
                            <Link className="action-primary" href={supportAccess.ctaHref}>
                              {supportAccess.ctaLabel}
                            </Link>
                            <Link className="action-secondary" href="/quickstart">
                              Open quickstart
                            </Link>
                          </div>
                        </div>
                          ) : null}

                        <form className="sales-form-grid help-center-support-form" onSubmit={(event) => void submitSupportRequest(event)}>
                          <div className="sales-form-row">
                            <label className="auth-input-shell">
                              <input
                                className="auth-input auth-input-stage"
                                onChange={(event) => setSupportName(event.target.value)}
                                placeholder="Your name"
                                type="text"
                                value={supportName}
                              />
                            </label>
                            <label className="auth-input-shell">
                              <input
                                className="auth-input auth-input-stage"
                                onChange={(event) => setSupportEmail(event.target.value)}
                                placeholder="Email"
                                type="email"
                                value={supportEmail}
                              />
                            </label>
                          </div>

                          <label className="auth-input-shell sales-textarea-shell">
                            <textarea
                              className="auth-input auth-input-stage sales-textarea"
                              onChange={(event) => setSupportMessage(event.target.value)}
                              placeholder={
                                supportAccess.allowed
                                  ? "Tell Galactus what blocked you: account access, funding, proof timing, payout, or API setup."
                                  : "Describe the issue: account access, funding, payout, proof timing, moderation, or API setup."
                              }
                              rows={4}
                              value={supportMessage}
                            />
                          </label>

                          <button className="action-primary auth-submit-stage" disabled={supportStatus === "sending"} type="submit">
                            {supportStatus === "sending"
                              ? "Sending..."
                              : supportAccess.allowed
                                ? "Send to Galactus"
                                : "Open support case"}
                          </button>
                        </form>
                        </>
                      )}

                      {supportNotice && supportStatus !== "sent" ? <div className="form-notice">{supportNotice}</div> : null}
                    </div>
                  </>
                ) : (
                  <div className="help-center-empty-panel">
                    <span className="mono-label">No matching article</span>
                    <h2 className="help-center-article-title">Try account access, funding, proof, or developer.</h2>
                    <p className="section-copy">
                      Help search checks the full support library. If nothing matches yet, clear the search or jump into one of the main support lanes above.
                    </p>
                    <div className="help-center-links">
                      <button className="docs-experience-result help-center-action-card" onClick={() => setQuery("")} type="button">
                        <strong>Show all articles</strong>
                        <p>Return to the full help library and browse every support article.</p>
                      </button>
                      <Link className="docs-experience-result" href="/docs/knowledge-base">
                        <strong>Knowledge base</strong>
                        <p>Read the full setup-to-settlement guides and continue from the next step that applies.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/forgot-password">
                        <strong>Password reset</strong>
                        <p>Send a new reset email and open the latest recovery link.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/docs">
                        <strong>Docs and API reference</strong>
                        <p>Open the full docs host for product rules, consent, fees, and enterprise API usage.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://developers.paytocommit.com">
                        <strong>Developer hub</strong>
                        <p>Jump into quickstarts, the HRS API, webhook guides, and sandbox setup.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://platform.paytocommit.com">
                        <strong>Platform workspace</strong>
                        <p>Open the signed-in workspace for projects, keys, reports, billing, and customer history.</p>
                      </Link>
                      <Link className="docs-experience-result" href="https://platform.paytocommit.com/workforce-rollout">
                        <strong>Employee rollout</strong>
                        <p>Jump into company-email invites, access review, and payroll-linked wallet rollout.</p>
                      </Link>
                      <Link className="docs-experience-result" href="/sales">
                        <strong>Enterprise request</strong>
                        <p>Open the HRS application form and review legal-name-backed consent requirements.</p>
                      </Link>
                    </div>
                  </div>
                )}
              </article>
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
