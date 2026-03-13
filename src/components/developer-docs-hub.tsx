"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenText, Boxes, Building2, Code2, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { buildHostedHref } from "@/lib/host-links";
import { getDeveloperPortalPath } from "@/lib/developer-platform-content";
import type { DocPage } from "@/lib/types";

type DeveloperDocsHubProps = {
  currentPage: DocPage;
  pages: DocPage[];
  isHome: boolean;
};

const featuredCards = [
  {
    label: "API Platform",
    title: "Build HRS lookups, protected webhooks, and enterprise exports.",
    href: "/reference",
    icon: Code2,
  },
  {
    label: "Workforce",
    title: "Roll out employee access, approval queues, and org-specific commitment programs.",
    href: "/workforce-rollout",
    icon: Building2,
  },
  {
    label: "Security",
    title: "Understand consent scope, audit trails, webhook signatures, and protected access review.",
    href: "/sandbox-access",
    icon: ShieldCheck,
  },
];

export function DeveloperDocsHub({ currentPage, pages, isHome }: DeveloperDocsHubProps) {
  const referencePages = pages.filter((page) =>
    ["Reference", "Workspace", "Operations", "Workforce Rollout", "Organization Operations"].includes(page.group),
  );
  const featuredReference = referencePages.slice(0, 8);
  const currentSlug = currentPage.slug.join("/");

  return (
    <div className="developer-hub-shell">
      <header className="developer-hub-topbar">
        <Link className="developer-hub-brand" href={buildHostedHref("developers")}>
          <span className="developer-hub-brand-mark">P</span>
          <span>PayToCommit Developers</span>
        </Link>

        <nav className="developer-hub-nav">
          <Link className={isHome ? "is-active" : ""} href={buildHostedHref("developers")}>Home</Link>
          <Link className={currentSlug.startsWith("reference") ? "is-active" : ""} href={buildHostedHref("developers", "/reference")}>API</Link>
          <Link className={currentSlug.startsWith("quickstarts") ? "is-active" : ""} href={buildHostedHref("developers", "/quickstarts")}>Quickstarts</Link>
          <Link className={currentSlug.startsWith("sandbox-access") ? "is-active" : ""} href={buildHostedHref("developers", "/sandbox-access")}>Security</Link>
          <Link className={currentSlug.startsWith("strategic-partners") ? "is-active" : ""} href={buildHostedHref("developers", "/strategic-partners")}>Enterprise</Link>
        </nav>

        <div className="developer-hub-actions">
          <Link className="developer-hub-dashboard-link" href={buildHostedHref("platform")} target="_blank">
            API Dashboard
            <ArrowUpRight size={14} />
          </Link>
          <ThemeToggle label={false} />
        </div>
      </header>

      <main className="developer-hub-main">
        {isHome ? (
          <>
            <section className="developer-hub-hero">
              <span className="developer-hub-eyebrow">Developer platform</span>
              <h1>Build with the HRS API, workforce rollout tools, and protected reporting lanes.</h1>
              <p>
                API reference, quickstarts, webhooks, sandbox access, reporting, and enterprise rollout all live in a
                single developer hub.
              </p>
              <div className="developer-hub-hero-actions">
                <Link className="developer-hub-primary" href={buildHostedHref("developers", "/quickstarts")}>
                  Open quickstarts
                </Link>
                <Link className="developer-hub-secondary" href={buildHostedHref("platform")} target="_blank">
                  Open API Dashboard
                </Link>
              </div>
            </section>

            <section className="developer-hub-banner">
              <div>
                <span className="mono-label">Platform workspace</span>
                <strong>Need projects, API keys, billing, or customer review?</strong>
                <p>The authenticated dashboard lives in a separate workspace so docs stay clean and operational work stays behind sign-in.</p>
              </div>
              <Link className="developer-hub-dashboard-link developer-hub-dashboard-link-inline" href={buildHostedHref("platform")} target="_blank">
                API Dashboard
                <ArrowUpRight size={14} />
              </Link>
            </section>

            <section className="developer-hub-grid">
              {featuredCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.title} className="developer-hub-card" href={buildHostedHref("developers", card.href)}>
                    <div className="developer-hub-card-icon">
                      <Icon size={20} />
                    </div>
                    <span className="mono-label">{card.label}</span>
                    <strong>{card.title}</strong>
                    <span className="developer-hub-card-link">
                      Open
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                );
              })}
            </section>

            <section className="developer-hub-reference">
              <div className="developer-hub-reference-heading">
                <div>
                  <span className="mono-label">Reference</span>
                  <h2>Start with the most-used guides.</h2>
                </div>
                <Link className="developer-hub-inline-link" href={buildHostedHref("developers", "/reference")}>
                  Full API reference
                </Link>
              </div>

              <div className="developer-hub-reference-grid">
                {featuredReference.map((page) => (
                  <Link
                    key={page.slug.join("/")}
                    className="developer-hub-reference-item"
                    href={buildHostedHref("developers", getDeveloperPortalPath(page.slug, "developers"))}
                  >
                    <span>{page.group}</span>
                    <strong>{page.title}</strong>
                    <p>{page.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="developer-hub-article-layout">
            <aside className="developer-hub-side-list">
              <div className="developer-hub-side-heading">
                <BookOpenText size={16} />
                <span>Reference</span>
              </div>
              {referencePages.slice(0, 18).map((page) => {
                const active = page.slug.join("/") === currentPage.slug.join("/");
                return (
                  <Link
                    key={page.slug.join("/")}
                    className={`developer-hub-side-link${active ? " is-active" : ""}`}
                    href={buildHostedHref("developers", getDeveloperPortalPath(page.slug, "developers"))}
                  >
                    <span>{page.title}</span>
                  </Link>
                );
              })}
            </aside>

            <article className="developer-hub-article">
              <div className="developer-hub-article-header">
                <span className="mono-label">{currentPage.group}</span>
                <h1>{currentPage.title}</h1>
                <p>{currentPage.summary}</p>
              </div>

              {currentPage.sections.map((section) => (
                <section key={section.id} className="developer-hub-article-section">
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}

              {currentPage.codeSample ? (
                <section className="developer-hub-code">
                  <div className="developer-hub-code-header">
                    <span>{currentPage.codeSample.title}</span>
                    <span>{currentPage.codeSample.language}</span>
                  </div>
                  <pre>{currentPage.codeSample.code}</pre>
                  {currentPage.codeSample.note ? <p>{currentPage.codeSample.note}</p> : null}
                </section>
              ) : null}
            </article>

            <aside className="developer-hub-rail">
              <section className="developer-hub-rail-card">
                <div className="developer-hub-side-heading">
                  <Boxes size={16} />
                  <span>Workspace</span>
                </div>
                <p>Need projects, keys, customer review, or billing? Open the authenticated workspace.</p>
                <Link className="developer-hub-dashboard-link developer-hub-dashboard-link-inline" href={buildHostedHref("platform")} target="_blank">
                  API Dashboard
                  <ArrowUpRight size={14} />
                </Link>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
