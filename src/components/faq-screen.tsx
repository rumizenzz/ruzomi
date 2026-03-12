"use client";

import Link from "next/link";
import {
  BadgeHelp,
  Banknote,
  ChevronDown,
  CircleDollarSign,
  MessagesSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { BrandLockup } from "@/components/brand-mark";
import { faqItems, faqSections, getFaqSearchResults } from "@/lib/faq-content";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

const sectionIcons = {
  "getting-started": BadgeHelp,
  "commitment-markets": Sparkles,
  "funds-payouts": CircleDollarSign,
  "reliability-enterprise": ShieldCheck,
  "spark-and-support": MessagesSquare,
} as const;

const defaultExpandedIds = new Set([
  "what-is-paytocommit",
  "proof-submit",
  "sovereign-spark",
  "human-reliability-api",
]);

export function FaqScreen({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() =>
    faqItems.reduce<Record<string, boolean>>((current, item) => {
      current[item.id] = defaultExpandedIds.has(item.id);
      return current;
    }, {}),
  );
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const searchResults = useMemo(() => getFaqSearchResults(deferredQuery), [deferredQuery]);
  const visibleIds = useMemo(() => new Set(searchResults.map((result) => result.id)), [searchResults]);
  const visibleSections = useMemo(() => {
    return faqSections
      .map((section) => ({
        ...section,
        items: faqItems.filter((item) => item.sectionId === section.id && (!normalizedQuery || visibleIds.has(item.id))),
      }))
      .filter((section) => section.items.length > 0);
  }, [normalizedQuery, visibleIds]);
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(new Date());
  }, []);

  function toggleItem(id: string) {
    setExpandedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <section className="auth-screen faq-screen">
      <div className="auth-screen-grid faq-screen-grid">
        <div className="faq-screen-head">
          <Link aria-label="PayToCommit home" className="auth-brand-link faq-brand-link" href="/">
            <BrandLockup />
          </Link>

          <div className="faq-screen-title-block">
            <span className="funding-state-chip">FAQ</span>
            <h1 className="faq-screen-title">FREQUENTLY ASKED QUESTIONS</h1>
          </div>

          <div className="faq-screen-date">
            <span className="mono-label">Date</span>
            <strong>{formattedDate}</strong>
          </div>
        </div>

        <div className="faq-screen-shell">
          <aside className="faq-side-rail" aria-label="FAQ sections">
            {faqSections.map((section) => {
              const Icon = sectionIcons[section.id as keyof typeof sectionIcons] ?? BadgeHelp;

              return (
                <a key={section.id} className="faq-side-link" href={`#${section.id}`}>
                  <Icon aria-hidden="true" size={18} />
                  <span>{section.title}</span>
                </a>
              );
            })}
          </aside>

          <div className="faq-panel">
            <div className="auth-panel-glow" aria-hidden="true" />
            <div className="faq-panel-core">
              <div className="section-stack section-stack-tight faq-panel-head">
                <p className="faq-panel-subtitle">
                  Search getting started, commitment markets, funding, payouts, consent, and enterprise access from one place.
                </p>
              </div>

              <label className="docs-experience-search faq-search">
                <Search aria-hidden="true" size={18} />
                <input
                  aria-label="Search FAQs"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search commitment markets, funding, proof, and reliability..."
                  type="search"
                  value={query}
                />
              </label>

              <div className="faq-summary-strip">
                <div className="faq-summary-card">
                  <span className="mono-label">Live search</span>
                  <strong>{normalizedQuery ? `${searchResults.length} matches` : `${faqItems.length} answers`}</strong>
                  <p>Results update while you type across the full FAQ library.</p>
                </div>
                <div className="faq-summary-card">
                  <span className="mono-label">Coverage</span>
                  <strong>Markets, funding, proof, enterprise</strong>
                  <p>The page stays focused on the questions people ask before they join, fund, integrate, or grant identity-backed consent.</p>
                </div>
                <div className="faq-summary-card">
                  <span className="mono-label">Need more</span>
                  <strong>Docs AI and Help Center</strong>
                  <p>Jump from the FAQ into the docs host or the full help library when you need the next step.</p>
                </div>
              </div>

              {visibleSections.length ? (
                <div className="faq-section-grid">
                  {visibleSections.map((section) => {
                    const Icon = sectionIcons[section.id as keyof typeof sectionIcons] ?? BadgeHelp;

                    return (
                      <section key={section.id} className="faq-section-card" id={section.id}>
                        <div className="faq-section-head">
                          <span className="faq-section-icon">
                            <Icon aria-hidden="true" size={18} />
                          </span>
                          <div className="section-stack section-stack-tight">
                            <strong>{section.title}</strong>
                            <p>{section.description}</p>
                          </div>
                        </div>

                        <div className="faq-item-list">
                          {section.items.map((item) => {
                            const isExpanded = normalizedQuery ? true : expandedIds[item.id];

                            return (
                              <div key={item.id} className={`faq-item ${isExpanded ? "is-open" : ""}`}>
                                <button
                                  aria-expanded={isExpanded ? "true" : "false"}
                                  className="faq-item-trigger"
                                  onClick={() => toggleItem(item.id)}
                                  type="button"
                                >
                                  <span>{item.question}</span>
                                  <ChevronDown aria-hidden="true" className={isExpanded ? "is-open" : ""} size={16} />
                                </button>

                                <div className={`faq-item-body ${isExpanded ? "is-open" : ""}`}>
                                  {item.answer.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="faq-empty">
                  <span className="mono-label">No matches</span>
                  <strong>Try a shorter question or clear the search.</strong>
                  <p>The FAQ search checks questions, answer copy, and keywords across every section.</p>
                  <button className="action-secondary" onClick={() => setQuery("")} type="button">
                    Clear search
                  </button>
                </div>
              )}

              <div className="faq-footer-strip">
                <div className="faq-footer-metric">
                  <span className="mono-label">Active Commitment Markets</span>
                  <strong>4,781</strong>
                </div>
                <div className="faq-footer-metric">
                  <span className="mono-label">Live Channels</span>
                  <strong>1,903</strong>
                </div>
              </div>

              <div className="docs-experience-footer">
                {footerLinks.map((link) => (
                  <Link key={link.href} className="footer-link footer-link-compact" href={link.href}>
                    {link.label}
                  </Link>
                ))}
                <Link className="footer-link footer-link-compact" href="/help-center">
                  Help Center
                </Link>
                <Link className="footer-link footer-link-compact" href="/docs/knowledge-base">
                  Knowledge Base
                </Link>
                <Link className="footer-link footer-link-compact" href="/docs/human-reliability-api">
                  Human Reliability API
                </Link>
                <Link className="footer-link footer-link-compact" href="/fees">
                  Fees
                </Link>
                <span className="help-center-footer-tail">
                  <Banknote aria-hidden="true" size={14} />
                  Search complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
