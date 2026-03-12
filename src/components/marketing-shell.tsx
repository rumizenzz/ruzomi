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
import { footerLinks } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SiteState } from "@/lib/types";

const defaultPrimaryLinks = [
  { href: "/chains", label: "Chains", active: (pathname: string) => pathname.startsWith("/chains") },
  { href: "/spark", label: "Spark", active: (pathname: string) => pathname.startsWith("/spark") },
  { href: "/app", label: "My Portfolio", active: (pathname: string) => pathname.startsWith("/app") },
];

const ruzomiPrimaryLinks = [
  { href: "/pools", label: "Markets", active: (pathname: string) => pathname.startsWith("/pools") },
  { href: "/?lane=direct", label: "Direct Sparks", active: (pathname: string) => pathname.startsWith("/ruzomi") || pathname === "/" },
  { href: "/?lane=artifacts", label: "Artifacts", active: (pathname: string) => pathname.startsWith("/ruzomi") || pathname === "/" },
  { href: "/app", label: "My Portfolio", active: (pathname: string) => pathname.startsWith("/app") },
];

const menuLinks = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/developers", label: "Developers" },
  { href: "/docs", label: "Docs" },
  { href: "/faqs", label: "FAQs" },
  { href: "/quickstart", label: "Quickstart" },
  { href: "/sales", label: "Sales" },
  { href: "/fees", label: "Fees" },
  { href: "/legal", label: "Legal" },
  { href: "/help-center", label: "Help Center" },
  { href: "/", label: "Ruzomi" },
  { href: "/contact", label: "Contact" },
];

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
  const siteState = useLiveSiteState(initialSiteState);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const isRuzomiHost = hostMode === "ruzomi";
  const isStandaloneRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/set-new-password" ||
    pathname === "/help-center" ||
    pathname === "/quickstart" ||
    pathname === "/sales" ||
    pathname === "/ruzomi" ||
    pathname === "/faqs" ||
    pathname === "/faq";
  const hideHeaderSearch = pathname === "/" || isStandaloneRoute;

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

  const visibleMenuLinks = useMemo(
    () =>
      menuLinks
        .filter((link) => link.href !== "/quickstart" || isEmailConfirmed)
        .filter((link) => !(isRuzomiHost && link.href === "/ruzomi")),
    [isEmailConfirmed, isRuzomiHost],
  );
  const primaryLinks = isRuzomiHost ? ruzomiPrimaryLinks : defaultPrimaryLinks;

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
                    className={`nav-link nav-link-shell ${pathname.startsWith("/ruzomi") ? "is-active" : ""}`}
                    href="/"
                  >
                    <span>Network</span>
                    <span className="nav-link-count nav-link-count-live">{siteState.liveChannelCount}</span>
                  </Link>
                ) : (
                  <CommitmentMarketsPopover
                    liveCount={siteState.livePoolCount}
                    loggedIn={isAuthenticated}
                    pathname={pathname}
                  />
                )}
                {primaryLinks.map((link) => {
                  const isActive = link.active(pathname);
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
                  action={isRuzomiHost ? "/ruzomi" : "/pools"}
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
                          <strong>Explore</strong>
                        </div>
                        <div className="console-link-grid">
                          {visibleMenuLinks.map((link) => (
                            <Link key={link.href} className="console-link" href={link.href}>
                              <span>{link.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="market-console-block market-console-block-wide">
                        <div className="market-console-block-head">
                          <span className="mono-label">Categories</span>
                          <strong>Commitment Markets</strong>
                        </div>
                        <div className="console-category-grid">
                          {siteState.categories.slice(0, 8).map((category) => (
                            <Link key={category.anchor} className="console-category-link" href={`/pools#${category.anchor}`}>
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
