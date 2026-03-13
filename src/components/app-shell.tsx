"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { buildAuthHref, buildFundingHref } from "@/lib/auth-flow";
import { AccountMenu } from "@/components/account-menu";
import { BrandLockup } from "@/components/brand-mark";
import { CommitmentMarketsPopover } from "@/components/commitment-markets-popover";
import { NotificationPopover } from "@/components/notification-popover";
import {
  SiteStateContext,
  WalletStateContext,
  useLiveSiteState,
  useLiveWalletState,
} from "@/components/live-data-hooks";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteState, WalletState } from "@/lib/types";

const primaryLinks = [
  { href: "/chains", label: "Chains", active: (pathname: string) => pathname.startsWith("/chains") },
  { href: "/spark", label: "Spark", active: (pathname: string) => pathname.startsWith("/spark") },
  { href: "/app", label: "My Portfolio", active: (pathname: string) => pathname.startsWith("/app") },
];

const appSections = [
  {
    title: "Workspace",
    links: [
      { href: "/app", label: "My Portfolio" },
      { href: "/app/wallet", label: "Wallet" },
      { href: "/app/history", label: "History" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/app/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
      { href: "/app/reliability", label: "Rewards & access" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/app/pools/new", label: "New market" },
      { href: "/docs", label: "Docs" },
    ],
  },
];

export function AppShell({
  children,
  initialSiteState,
  initialWalletState,
}: {
  children: React.ReactNode;
  initialSiteState: SiteState;
  initialWalletState: WalletState;
}) {
  const pathname = usePathname();
  const siteState = useLiveSiteState(initialSiteState);
  const walletState = useLiveWalletState(initialWalletState);
  const isAuthenticated = Boolean(walletState.viewer);
  const isFundingRoute = pathname === "/app/verify" || pathname === "/app/wallet/fund";
  const loginHref = buildAuthHref("login", pathname);
  const signupHref = buildAuthHref("signup", pathname);
  const portfolioHref = isAuthenticated ? "/app" : buildAuthHref("login", "/app");
  const addFundsHref = buildFundingHref({
    isAuthenticated,
    identityStatus: walletState.viewer?.identityStatus,
  });
  const visibleAppSections = appSections.map((section) => ({
    ...section,
    links: (isAuthenticated ? section.links : section.links.filter((link) => link.href !== "/app/profile")).map((link) => ({
      ...link,
      href:
        isAuthenticated
          ? link.href
          : link.href === "/app/pools/new"
            ? buildAuthHref("signup", "/app/pools/new?resumeDraft=1")
            : link.href === "/settings"
              ? buildAuthHref("login", "/settings")
              : link.href.startsWith("/app")
                ? buildAuthHref("login", link.href)
                : link.href,
    })),
  }));

  if (isFundingRoute) {
    return (
      <SiteStateContext.Provider value={siteState}>
        <WalletStateContext.Provider value={walletState}>
          <div className="app-shell-auth-route">{children}</div>
        </WalletStateContext.Provider>
      </SiteStateContext.Provider>
    );
  }

  return (
    <SiteStateContext.Provider value={siteState}>
      <WalletStateContext.Provider value={walletState}>
        <div className="content-wrap app-shell-frame app-shell-frame-dark">
          <div className="glass-panel app-shell-header app-shell-header-dark">
            <div className="dashboard-shell-bar dashboard-shell-bar-no-search">
              <Link aria-label="PayToCommit home" className="brand-home-link brand-home-link-shell" href="/">
                <BrandLockup compact />
              </Link>

              <nav aria-label="Primary" className="nav-links nav-links-primary shell-primary-nav dashboard-nav">
                <CommitmentMarketsPopover liveCount={siteState.livePoolCount} loggedIn={isAuthenticated} pathname={pathname} />
                {primaryLinks.map((link) => {
                  const isActive = link.active(pathname);
                  const href = link.label === "My Portfolio" ? portfolioHref : link.href;

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

              <div className="header-actions dashboard-shell-actions dashboard-shell-actions-auth">
                <div className="header-fund-stack">
                  <Link className="action-primary header-fund-button" href={addFundsHref}>
                    Add Funds
                  </Link>
                  <div className="header-cash-note">
                    <span>Cash Available:</span>
                    <strong>{walletState.wallet.availableLabel}</strong>
                  </div>
                </div>
                {isAuthenticated ? (
                  <>
                    <NotificationPopover notifications={walletState.notifications} />
                    <AccountMenu label="Account" />
                  </>
                ) : (
                  <div className="header-auth-row">
                    <Link className="header-auth-link" href={loginHref}>
                      Log in
                    </Link>
                    <Link className="header-desk-link" href={signupHref}>
                      Sign up
                    </Link>
                  </div>
                )}
                <details className="market-console market-console-right">
                  <summary className="shell-icon-button shell-icon-button-dark shell-icon-button-with-label" aria-label="Open menu">
                    <Menu size={18} />
                    <span>Menu</span>
                  </summary>
                  <div className="market-console-panel market-console-panel-right shell-menu-panel">
                    <div className="market-console-header">
                      <strong className="market-console-title">Menu</strong>
                      <span className="mono-label">Keep the next account action easy to find.</span>
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
                          <strong>Account</strong>
                        </div>
                        <div className="shell-menu-sections">
                          {visibleAppSections.map((section) => (
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
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="app-main">{children}</div>
        </div>
      </WalletStateContext.Provider>
    </SiteStateContext.Provider>
  );
}
