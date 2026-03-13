"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buildAuthHref } from "@/lib/auth-flow";
import { BrandLockup } from "@/components/brand-mark";
import { CommitmentMarketsPopover } from "@/components/commitment-markets-popover";
import { SiteStateContext, useLiveSiteState } from "@/components/live-data-hooks";
import { MarketingHeaderAccount } from "@/components/marketing-header-account";
import { ThemeToggle } from "@/components/theme-toggle";
import type { HostMode } from "@/lib/host-mode";
import { buildHostAwareRuzomiHref, buildHostedHref } from "@/lib/host-links";
import { footerLinks } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SiteState } from "@/lib/types";

const defaultPrimaryLinks = [
  { href: "/chains", label: "Chains", active: (pathname: string) => pathname.startsWith("/chains") },
  { href: "/spark", label: "Spark", active: (pathname: string) => pathname.startsWith("/spark") },
  { href: "/app", label: "My Portfolio", active: (pathname: string) => pathname.startsWith("/app") },
];

const ruzomiPrimaryLinks = [
  { href: buildHostedHref("paytocommit", "/pools"), label: "Markets", active: (pathname: string) => pathname.startsWith("/pools") },
  { href: "/?lane=direct", label: "Direct Sparks", active: (pathname: string) => pathname.startsWith("/ruzomi") },
  { href: "/?lane=artifacts", label: "Artifacts", active: (pathname: string) => pathname.startsWith("/ruzomi") },
  { href: buildHostedHref("paytocommit", "/app"), label: "My Portfolio", active: (pathname: string) => pathname.startsWith("/app") },
];

const menuSections = [
  {
    title: "Explore",
    links: [
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/", label: "Ruzomi" },
      { href: buildHostedHref("platform"), label: "Platform" },
      { href: buildHostedHref("developers"), label: "Developers" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: buildHostedHref("docs"), label: "Docs" },
      { href: buildHostedHref("status"), label: "Status" },
      { href: "/faqs", label: "FAQs" },
      { href: "/help-center", label: "Help Center" },
      { href: "/quickstart", label: "Quickstart" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/sales", label: "Sales" },
      { href: "/fees", label: "Fees" },
      { href: "/legal", label: "Legal" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

function normalizeHostedPathname(pathname: string, hostMode: HostMode) {
  if (hostMode === "ruzomi" && !pathname.startsWith("/ruzomi")) {
    return pathname === "/" ? "/ruzomi" : `/ruzomi${pathname}`;
  }

  if ((hostMode === "developers" || hostMode === "platform") && !pathname.startsWith("/developers")) {
    return pathname === "/" ? "/developers" : `/developers${pathname}`;
  }

  if (hostMode === "status" && !pathname.startsWith("/status")) {
    return pathname === "/" ? "/status" : `/status${pathname}`;
  }

  if (hostMode === "docs" && !pathname.startsWith("/docs")) {
    return pathname === "/" ? "/docs" : `/docs${pathname}`;
  }

  return pathname;
}

function resolveHostAwareHref(href: string, hostMode: HostMode) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  if (hostMode !== "paytocommit" && href.startsWith("/")) {
    return buildHostedHref("paytocommit", href);
  }

  return href;
}

export function MarketingShell({
  children,
  hostMode,
  initialSiteState,
}: {
  children: React.ReactNode;
  hostMode: HostMode;
  initialSiteState: SiteState;
}) {
  const pathname = usePathname();
  const normalizedPathname = useMemo(() => normalizeHostedPathname(pathname, hostMode), [pathname, hostMode]);
  const siteState = useLiveSiteState(initialSiteState);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const isRuzomiHost = hostMode === "ruzomi";
  const isStandaloneRoute =
    normalizedPathname === "/login" ||
    normalizedPathname === "/signup" ||
    normalizedPathname === "/forgot-password" ||
    normalizedPathname === "/set-new-password" ||
    normalizedPathname === "/help-center" ||
    normalizedPathname === "/quickstart" ||
    normalizedPathname === "/sales" ||
    normalizedPathname === "/ruzomi" ||
    normalizedPathname === "/faqs" ||
    normalizedPathname === "/faq";
  const hideHeaderSearch = normalizedPathname === "/" || isStandaloneRoute;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(data.user));
      setIsEmailConfirmed(Boolean(data.user?.email_confirmed_at));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setIsEmailConfirmed(Boolean(session?.user?.email_confirmed_at));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const visibleMenuSections = useMemo(
    () =>
      menuSections
        .map((section) => ({
          ...section,
          links: section.links
            .filter((link) => link.href !== "/quickstart" || isEmailConfirmed)
            .filter((link) => !(isRuzomiHost && link.label === "Ruzomi")),
        }))
       .filter((section) => section.links.length),
    [isEmailConfirmed, isRuzomiHost],
  );
  const ruzomiRootHref = buildHostAwareRuzomiHref(hostMode);
  const primaryLinks = isRuzomiHost
    ? ruzomiPrimaryLinks.map((link) =>
        link.label === "Direct Sparks" || link.label === "Artifacts"
          ? { ...link, href: buildHostAwareRuzomiHref(hostMode, link.href) }
          : link,
      )
    : defaultPrimaryLinks.map((link) =>
        link.label === "Spark"
          ? { ...link, href: hostMode === "paytocommit" ? buildHostedHref("ruzomi") : buildHostAwareRuzomiHref(hostMode) }
          : link,
      );
  const visibleMenuSectionsWithHostLinks = useMemo(
    () =>
      visibleMenuSections.map((section) => ({
        ...section,
        links: section.links.map((link) => ({
          ...link,
          href:
            link.label === "Ruzomi"
              ? hostMode === "paytocommit"
                ? buildHostedHref("ruzomi")
                : ruzomiRootHref
              : resolveHostAwareHref(link.href, hostMode),
        })),
      })),
    [visibleMenuSections, ruzomiRootHref, hostMode],
  );

  return (
    <SiteStateContext.Provider value={siteState}>
      {isStandaloneRoute ? (
        <div className="marketing-shell marketing-shell-dark marketing-shell-auth">
          <main className="auth-route-main">{children}</main>
        </div>
      ) : (
      <div className="marketing-shell marketing-shell-dark">
        <header className="marketing-header marketing-header-dark">
          <div className="content-wrap marketing-header-stack marketing-header-stack-dashboard">
            <div className={`dashboard-shell-bar ${hideHeaderSearch ? "dashboard-shell-bar-no-search" : ""}`}>
              <Link
                aria-label={isRuzomiHost ? "Ruzomi home" : "PayToCommit home"}
                className="brand-home-link brand-home-link-shell"
                href="/"
              >
                <BrandLockup compact product={isRuzomiHost ? "ruzomi" : "paytocommit"} />
              </Link>

              <nav aria-label="Primary" className="nav-links nav-links-primary shell-primary-nav dashboard-nav">
                {isRuzomiHost ? (
                  <Link
                    className={`nav-link nav-link-shell ${normalizedPathname.startsWith("/ruzomi") ? "is-active" : ""}`}
                    href={ruzomiRootHref}
                  >
                    <span>Network</span>
                    <span className="nav-link-count nav-link-count-live">{siteState.liveChannelCount}</span>
                  </Link>
                ) : (
                  <CommitmentMarketsPopover
                    liveCount={siteState.livePoolCount}
                    loggedIn={isAuthenticated}
                    pathname={normalizedPathname}
                  />
                )}
                {primaryLinks.map((link) => {
                  const isActive = link.active(normalizedPathname);
                  const href =
                    link.label === "My Portfolio" && !isAuthenticated ? buildAuthHref("login", "/app") : link.href;

                  return (
                    <Link
                      key={link.label}
                      className={`nav-link nav-link-shell ${isActive ? "is-active" : ""}`}
                      href={href}
                    >
                      <span>{link.label}</span>
                      {link.label === "Commitment Markets" ? (
                        <span className="nav-link-count nav-link-count-live">{siteState.livePoolCount}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              {!hideHeaderSearch ? (
                <form
                  action={isRuzomiHost ? "/" : "/pools"}
                  className="shell-search dashboard-shell-search"
                  role="search"
                >
                  <Search size={16} />
                  <label className="sr-only" htmlFor="market-search">
                    {isRuzomiHost ? "Search channels, sparks, or markets" : "Commit on anything"}
                  </label>
                  <input
                    id="market-search"
                    name="q"
                    placeholder={isRuzomiHost ? "Search channels, sparks, or markets" : "Commit on anything"}
                    type="search"
                  />
                </form>
              ) : null}

              <div className="header-actions dashboard-shell-actions">
                <MarketingHeaderAccount />
                <details className="market-console market-console-right">
                  <summary className="shell-icon-button shell-icon-button-dark shell-icon-button-with-label" aria-label="Open menu">
                    <Menu size={18} />
                    <span>Menu</span>
                  </summary>
                  <div className="market-console-panel market-console-panel-right shell-menu-panel">
                    <div className="market-console-header">
                      <strong className="market-console-title">Menu</strong>
                      <span className="mono-label">Open the next surface without the clutter.</span>
                    </div>

                    <div className="market-console-grid">
                      <div className="market-console-block market-console-block-wide">
                        <div className="market-console-block-head">
                          <span className="mono-label">View</span>
                          <strong>Theme</strong>
                        </div>
                        <ThemeToggle label />
                      </div>

                      <div className="market-console-block market-console-block-wide">
                        <div className="market-console-block-head">
                          <span className="mono-label">Open</span>
                          <strong>Go somewhere useful</strong>
                        </div>
                        <div className="shell-menu-sections">
                          {visibleMenuSectionsWithHostLinks.map((section) => (
                            <div key={section.title} className="shell-menu-section">
                              <div className="shell-menu-section-head">
                                <span className="mono-label">{section.title}</span>
                              </div>
                              <div className="shell-menu-section-list">
                                {section.links.map((link) => (
                                  <Link key={link.href} className="console-link" href={link.href}>
                                    <span>{link.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="market-console-block market-console-block-wide">
                        <div className="market-console-block-head">
                          <span className="mono-label">Categories</span>
                          <strong>Commitment Markets</strong>
                        </div>
                        <div className="console-category-grid">
                          {siteState.categories.slice(0, 6).map((category) => (
                            <Link
                              key={category.anchor}
                              className="console-category-link"
                              href={resolveHostAwareHref(`/pools#${category.anchor}`, hostMode)}
                            >
                              <span>{category.category}</span>
                              <strong>{category.liveCount || category.totalCount}</strong>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </header>

        <main className="content-wrap page-stack dashboard-main">{children}</main>

        <footer className="content-wrap marketing-footer dashboard-footer">
          <div className="divider divider-dark" />
          <div className="footer-grid">
            <div className="footer-links" aria-label="Footer">
              {footerLinks.map((link) => (
                <Link key={link.href} className="footer-link" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
      )}
    </SiteStateContext.Provider>
  );
}
