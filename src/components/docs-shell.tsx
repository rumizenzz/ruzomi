"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Code2, Search, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { DocsAiAssistant } from "@/components/docs-ai-assistant";
import { getDocPath, getDocsSearchResults } from "@/lib/docs-content";
import type { DocPage, GalactusAccessState } from "@/lib/types";

function getPageKey(slug: string[]) {
  return slug.join("/");
}

export function DocsShell({
  currentPage,
  docsPages,
  docsHost = false,
  galactusAccess,
  searchQuery,
}: {
  currentPage: DocPage;
  docsPages: DocPage[];
  docsHost?: boolean;
  galactusAccess: GalactusAccessState;
  searchQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchQuery ?? "");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    docsPages.reduce<Record<string, boolean>>((groups, page) => {
      groups[page.group] = true;
      return groups;
    }, {}),
  );
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const docsHomeHref = getDocPath([], docsHost);
  const knowledgeBasePages = useMemo(
    () => docsPages.filter((page) => page.group === "Knowledge Base" && page.slug.length > 0),
    [docsPages],
  );
  const enterprisePages = useMemo(
    () => docsPages.filter((page) => page.group === "Enterprise" && page.slug.length > 0),
    [docsPages],
  );
  const protocolPages = useMemo(
    () => docsPages.filter((page) => page.group === "Core Protocols" && page.slug.length > 0),
    [docsPages],
  );

  const searchResults = useMemo(() => getDocsSearchResults(deferredQuery), [deferredQuery]);
  const docsResultCountLabel = normalizedQuery ? `${searchResults.length} matches` : `${docsPages.length} pages`;
  const groupCounts = useMemo(() => {
    return docsPages.reduce<Record<string, number>>((counts, page) => {
      counts[page.group] = (counts[page.group] ?? 0) + 1;
      return counts;
    }, {});
  }, [docsPages]);
  const filteredPages = useMemo(() => {
    if (!normalizedQuery) {
      return docsPages;
    }

    const keys = new Set(searchResults.map((result) => getPageKey(result.slug)));
    return docsPages.filter((page) => keys.has(getPageKey(page.slug)));
  }, [docsPages, normalizedQuery, searchResults]);

  const groupedPages = useMemo(() => {
    return filteredPages.reduce<Record<string, DocPage[]>>((groups, page) => {
      const next = groups[page.group] ?? [];
      next.push(page);
      groups[page.group] = next;
      return groups;
    }, {});
  }, [filteredPages]);

  const activePage = useMemo(() => {
    if (!normalizedQuery) {
      return currentPage;
    }

    const currentKey = getPageKey(currentPage.slug);
    return filteredPages.find((page) => getPageKey(page.slug) === currentKey) ?? filteredPages[0] ?? currentPage;
  }, [currentPage, filteredPages, normalizedQuery]);
  const relatedPages = useMemo(() => {
    return docsPages
      .filter((page) => page.group === activePage.group && getPageKey(page.slug) !== getPageKey(activePage.slug))
      .slice(0, 4);
  }, [activePage, docsPages]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (normalizedQuery) {
      nextParams.set("q", normalizedQuery);
    }

    const nextQuery = nextParams.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextHref, { scroll: false });
  }, [normalizedQuery, pathname, router]);

  function toggleGroup(group: string) {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }

  return (
    <section className="auth-screen docs-experience-screen">
      <div className="auth-screen-grid docs-experience-grid-shell">
        <div className="auth-brand-hero docs-experience-brand">
          <Link aria-label="PayToCommit docs" className="auth-brand-link" href={docsHomeHref}>
            <BrandLockup />
          </Link>
        </div>

        <div className="docs-experience-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="docs-experience-panel-core">
            <div className="docs-experience-panel-head">
              <div className="section-stack section-stack-tight docs-experience-head">
                <span className="funding-state-chip">Docs</span>
                <h1 className="docs-experience-title">PAYTOCOMMIT DOCS</h1>
                <p className="docs-experience-subtitle">
                  Product rules, setup guides, funding steps, proof timing, and Human Reliability API reference in one place.
                </p>
              </div>

              <label className="docs-experience-search">
                <Search aria-hidden="true" size={18} />
                <input
                  aria-label="Search docs"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search setup guides, rules, APIs, and enterprise docs..."
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div className="docs-experience-summary-strip">
                <div className="docs-experience-summary-card">
                  <span className="mono-label">Docs search</span>
                  <strong>{docsResultCountLabel}</strong>
                  <p>Results update live across product docs, setup guides, and API reference pages.</p>
                </div>
                <div className="docs-experience-summary-card">
                  <span className="mono-label">Human Reliability API</span>
                  <strong>Consent scoped</strong>
                  <p>
                    Protected lookups require a scoped enterprise key, a declared purpose, active consent, and the right identity scope.
                  </p>
                </div>
                <div className="docs-experience-summary-card">
                  <span className="mono-label">Usage billing</span>
                  <strong>Enterprise metered</strong>
                  <p>Billing tracks protected lookups, reports, exports, and the audit trail attached to them.</p>
                </div>
                <div className="docs-experience-summary-card">
                  <span className="mono-label">Knowledge base</span>
                  <strong>Setup to settlement</strong>
                  <p>Guides cover first funding, mobile proof, result artifacts, and enterprise setup.</p>
                </div>
              </div>

              <div className="docs-experience-shortcuts">
                <Link
                  className="docs-experience-result docs-experience-shortcut"
                  href={getDocPath(["knowledge-base"], docsHost)}
                >
                  <span className="mono-label">Knowledge base</span>
                  <strong>Start-to-finish guides</strong>
                  <p>Open the guide library for first deposit, proof timing, Ruzomi, and enterprise setup.</p>
                </Link>
                <Link
                  className="docs-experience-result docs-experience-shortcut"
                  href={getDocPath(["human-reliability-api"], docsHost)}
                >
                  <span className="mono-label">Enterprise</span>
                  <strong>Human Reliability API</strong>
                  <p>Consent scope, identity-backed matching, HRS history, and usage-based billing.</p>
                </Link>
                <Link
                  className="docs-experience-result docs-experience-shortcut"
                  href={getDocPath(["enterprise-sales-setup"], docsHost)}
                >
                  <span className="mono-label">Sales</span>
                  <strong>Enterprise setup</strong>
                  <p>Application flow, use-case review, billing setup, and access qualification.</p>
                </Link>
                <Link className="docs-experience-result docs-experience-shortcut" href="https://developers.paytocommit.com">
                  <span className="mono-label">Developers</span>
                  <strong>Developer hub</strong>
                  <p>Open quickstarts, reference, webhooks, pricing, sandbox access, and production review.</p>
                </Link>
                <Link className="docs-experience-result docs-experience-shortcut" href="https://platform.paytocommit.com">
                  <span className="mono-label">Platform</span>
                  <strong>Workspace dashboard</strong>
                  <p>Move into organizations, projects, API keys, customer drill-down, reports, and audit history.</p>
                </Link>
                <Link className="docs-experience-result docs-experience-shortcut" href="/help-center">
                  <span className="mono-label">Support</span>
                  <strong>Help Center</strong>
                  <p>Account access, funding, proof windows, and developer help.</p>
                </Link>
                <Link className="docs-experience-result docs-experience-shortcut" href="/faqs">
                  <span className="mono-label">FAQ</span>
                  <strong>Common answers</strong>
                  <p>Funding, fees, proof timing, Generate access, and enterprise rules.</p>
                </Link>
                <Link className="docs-experience-result docs-experience-shortcut" href="/quickstart">
                  <span className="mono-label">Quickstart</span>
                  <strong>First $10 path</strong>
                  <p>Verify identity, add funds, finish one commitment, and unlock the active Galactus window.</p>
                </Link>
              </div>

            <div className="docs-experience-layout">
              <aside className="docs-experience-nav">
                <div className="docs-experience-nav-intro">
                  <span className="mono-label">Public docs</span>
                  <strong>Read product rules, fees, and API references without signing in.</strong>
                  <p>
                    Public docs stay open. Direct Galactus threads unlock only after the account earns the active 30-day window. Public help and enterprise intake still stay reachable.
                  </p>
                </div>
                <div className="docs-experience-nav-intro">
                  <span className="mono-label">Reading lanes</span>
                  <strong>Overview, guides, product rules, enterprise, and reference.</strong>
                  <p>
                    Use the knowledge-base lane for first funding, first stake, mobile proof, and result flow. Use the reference lane for endpoints, consent, and billing details.
                  </p>
                </div>
                {Object.entries(groupedPages).map(([group, pages]) => (
                  <div key={group} className="docs-experience-nav-group">
                    {(() => {
                      const isOpen = openGroups[group] ?? group === activePage.group;

                    return (
                      <>
                    <button
                      aria-expanded={isOpen ? "true" : "false"}
                      className="docs-experience-nav-toggle"
                      onClick={() => toggleGroup(group)}
                      type="button"
                    >
                      <span className="docs-experience-nav-meta">
                        <span className="mono-label">{group}</span>
                        <span className="docs-count-pill">{groupCounts[group] ?? pages.length}</span>
                      </span>
                      <ChevronDown aria-hidden="true" className={isOpen ? "is-open" : ""} size={14} />
                    </button>
                    <div className={`docs-experience-nav-links ${isOpen ? "is-open" : ""}`}>
                      {pages.map((page) => {
                        const href = getDocPath(page.slug, docsHost);
                        const isActive = getPageKey(page.slug) === getPageKey(activePage.slug);

                        return (
                          <Link
                            key={href}
                            className={`docs-experience-nav-link ${isActive ? "is-active" : ""}`}
                            href={href}
                          >
                            <span>{page.title}</span>
                            <ChevronRight aria-hidden="true" size={14} />
                          </Link>
                        );
                      })}
                    </div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </aside>

              <div className="docs-experience-content">
                {normalizedQuery ? (
                  <div className="docs-experience-results">
                    <div className="docs-experience-results-head">
                      <span className="mono-label">Search results</span>
                      <span>{searchResults.length} matches</span>
                    </div>
                    {searchResults.length ? (
                      searchResults.slice(0, 6).map((result) => (
                        <Link
                          key={`${getPageKey(result.slug)}-${result.match}`}
                          className="docs-experience-result"
                          href={getDocPath(result.slug, docsHost)}
                        >
                          <span className="mono-label">{result.group}</span>
                          <strong>{result.title}</strong>
                          <p>{result.match}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="docs-experience-empty">
                        <span className="mono-label">No matches</span>
                        <strong>Try a shorter search or open a nearby section from the left.</strong>
                        <p>Docs search checks titles, summaries, section copy, and API reference text.</p>
                      </div>
                    )}
                  </div>
                ) : null}

                <article className="docs-experience-article">
                  <div className="section-stack section-stack-tight">
                    <div className="docs-experience-current">
                      <span className="eyebrow">{activePage.eyebrow}</span>
                      <span className="docs-count-pill">{activePage.group}</span>
                    </div>
                    <h2 className="docs-experience-article-title">{activePage.title}</h2>
                    <p className="section-copy">{activePage.summary}</p>
                  </div>

                  <div className="docs-experience-inline-cards">
                    <div className="docs-experience-inline-card">
                      <span className="mono-label">Page sections</span>
                      <strong>{activePage.sections.length}</strong>
                      <p>Each section is linked and available for Docs AI citations.</p>
                    </div>
                    <div className="docs-experience-inline-card">
                      <span className="mono-label">Enterprise access</span>
                      <strong>Scoped and auditable</strong>
                      <p>Keys stay tied to an app, a purpose, an approved consent scope, and a clear billing lane.</p>
                    </div>
                    <div className="docs-experience-inline-card">
                      <span className="mono-label">Access rule</span>
                      <strong>{galactusAccess.allowed ? "Galactus active" : "Galactus locked"}</strong>
                      <p>{galactusAccess.countdownLabel ?? galactusAccess.body}</p>
                    </div>
                  </div>

                  {!normalizedQuery ? (
                    <div className="docs-reading-map">
                      <div className="docs-reading-map-card">
                        <span className="mono-label">Knowledge base</span>
                        <strong>Start-to-finish guides for first funding, proof timing, results, and the social layer.</strong>
                        <div className="docs-reading-map-links">
                          {knowledgeBasePages.slice(0, 4).map((page) => (
                            <Link key={getPageKey(page.slug)} className="docs-reading-map-link" href={getDocPath(page.slug, docsHost)}>
                              <span>{page.title}</span>
                              <ChevronRight aria-hidden="true" size={14} />
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="docs-reading-map-card">
                        <span className="mono-label">Enterprise</span>
                        <strong>Consent scope, identity-backed matching, usage billing, and application setup.</strong>
                        <div className="docs-reading-map-links">
                          {enterprisePages.slice(0, 4).map((page) => (
                            <Link key={getPageKey(page.slug)} className="docs-reading-map-link" href={getDocPath(page.slug, docsHost)}>
                              <span>{page.title}</span>
                              <ChevronRight aria-hidden="true" size={14} />
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="docs-reading-map-card">
                        <span className="mono-label">Developer hub</span>
                        <strong>Public docs for evaluation, then the signed-in workspace for projects, keys, and customer history.</strong>
                        <div className="docs-reading-map-links">
                          <Link className="docs-reading-map-link" href="https://developers.paytocommit.com">
                            <span>Open developer hub</span>
                            <ChevronRight aria-hidden="true" size={14} />
                          </Link>
                          <Link className="docs-reading-map-link" href="https://developers.paytocommit.com/sandbox-access">
                            <span>Request sandbox access</span>
                            <ChevronRight aria-hidden="true" size={14} />
                          </Link>
                          <Link className="docs-reading-map-link" href="https://platform.paytocommit.com">
                            <span>Open platform workspace</span>
                            <ChevronRight aria-hidden="true" size={14} />
                          </Link>
                          <Link className="docs-reading-map-link" href="https://platform.paytocommit.com/customers">
                            <span>Open customer drill-down</span>
                            <ChevronRight aria-hidden="true" size={14} />
                          </Link>
                        </div>
                      </div>

                      <div className="docs-reading-map-card">
                        <span className="mono-label">Core rules</span>
                        <strong>Identity, consent, proof integrity, and protected access rules.</strong>
                        <div className="docs-reading-map-links">
                          {(activePage.group === "Core Protocols" ? relatedPages : protocolPages).slice(0, 4).map((page) => (
                            <Link key={getPageKey(page.slug)} className="docs-reading-map-link" href={getDocPath(page.slug, docsHost)}>
                              <span>{page.title}</span>
                              <ChevronRight aria-hidden="true" size={14} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {activePage.codeSample ? (
                    <div className="docs-code-card">
                      <div className="docs-code-head">
                        <div className="docs-code-title">
                          <Code2 aria-hidden="true" size={16} />
                          <strong>{activePage.codeSample.title}</strong>
                        </div>
                        <span className="mono-label">{activePage.codeSample.language}</span>
                      </div>
                      <pre className="docs-code-block">
                        <code>{activePage.codeSample.code}</code>
                      </pre>
                      {activePage.codeSample.note ? <p className="detail-text">{activePage.codeSample.note}</p> : null}
                    </div>
                  ) : null}

                  <div className="docs-experience-section-list">
                    {activePage.sections.map((section) => (
                      <section key={section.id} className="docs-experience-section" id={section.id}>
                        <h3 className="card-title">{section.title}</h3>
                        <div className="section-stack">
                          {section.body.map((paragraph) => (
                            <p key={paragraph} className="section-copy">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            <div className="docs-experience-ai" id="docs-ai">
              <div className="docs-experience-ai-note">
                <span className="mono-label">Docs AI</span>
                <div className="section-stack section-stack-tight">
                  <strong>Docs search is public. Direct Galactus help unlocks after one verified completed commitment inside the active 30-day window.</strong>
                  <p className="detail-text">
                    Banks, enterprises, and platforms can use the Human Reliability API only within the granted consent scope, identity scope, and published usage billing model. Public help and enterprise intake stay available without a direct Galactus thread.
                  </p>
                </div>
                <Sparkles aria-hidden="true" size={18} />
              </div>
              <DocsAiAssistant access={galactusAccess} />
            </div>
          </div>
        </div>

        <div className="funding-bottom-mark docs-experience-mark" aria-hidden="true">
          <BrandMark />
        </div>

        <div className="docs-experience-footer">
          <Link className="auth-footer-link" href="#docs-ai">
            Docs AI
          </Link>
          <Link className="auth-footer-link" href="/legal">
            Legal
          </Link>
        </div>
      </div>
    </section>
  );
}
