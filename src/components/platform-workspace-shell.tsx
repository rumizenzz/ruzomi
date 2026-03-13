"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  CreditCard,
  FileClock,
  FileText,
  KeyRound,
  MoonStar,
  Search,
  Settings,
  Sparkles,
  SunMedium,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { PlatformAuthGate } from "@/components/platform-auth-gate";
import { buildHostedHref } from "@/lib/host-links";
import { getDeveloperPortalPath } from "@/lib/developer-platform-content";
import type { DocPage } from "@/lib/types";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "paytocommit-theme";

type PlatformWorkspaceShellProps = {
  currentPage: DocPage;
  pages: DocPage[];
  viewerEmail: string | null;
};

const platformSidebarGroups = [
  {
    label: "Workspace",
    items: [
      { slug: ["platform-dashboard"], label: "Home", icon: BarChart3 },
      { slug: ["organizations"], label: "Organizations", icon: Building2 },
      { slug: ["projects"], label: "Projects", icon: BriefcaseBusiness },
      { slug: ["api-keys"], label: "API keys", icon: KeyRound },
      { slug: ["playground"], label: "Playground", icon: Sparkles },
    ],
  },
  {
    label: "Operations",
    items: [
      { slug: ["customers"], label: "Customers", icon: CircleUserRound },
      { slug: ["reports"], label: "Reports", icon: FileText },
      { slug: ["billing-usage"], label: "Billing", icon: CreditCard },
      { slug: ["audit-logs"], label: "Audit logs", icon: FileClock },
    ],
  },
  {
    label: "Workforce",
    items: [
      { slug: ["employee-invites"], label: "Invites", icon: CircleUserRound },
      { slug: ["employee-access-queue"], label: "Approval queue", icon: FileClock },
      { slug: ["employees"], label: "Employees", icon: Building2 },
      { slug: ["organization-workspace"], label: "Org workspace", icon: BriefcaseBusiness },
      { slug: ["continuity-access"], label: "Continuity access", icon: FileText },
    ],
  },
];

function formatViewerName(viewerEmail: string | null) {
  if (!viewerEmail) {
    return "Platform user";
  }

  const [localPart] = viewerEmail.split("@");
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`)
    .join(" ");
}

function getInitials(viewerEmail: string | null) {
  const label = formatViewerName(viewerEmail);
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function resolveInitialTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const activeTheme = document.documentElement.dataset.theme;
    if (activeTheme === "light" || activeTheme === "dark") {
      return activeTheme;
    }
  }

  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "system";
}

function applyPreferredTheme(theme: ThemeMode) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (theme === "system") {
    window.localStorage.removeItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = prefersDark ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

function PlatformAppearanceMenu() {
  const [theme, setTheme] = useState<ThemeMode>(resolveInitialTheme);

  useEffect(() => {
    applyPreferredTheme(theme);

    if (theme !== "system" || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyPreferredTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const options: Array<{ value: ThemeMode; label: string; icon: typeof SunMedium }> = [
    { value: "light", label: "Light", icon: SunMedium },
    { value: "dark", label: "Dark", icon: MoonStar },
    { value: "system", label: "System", icon: Settings },
  ];

  return (
    <div className="platform-profile-themes" role="group" aria-label="Appearance">
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            className={`platform-profile-theme-chip${active ? " is-active" : ""}`}
            onClick={() => setTheme(option.value)}
            type="button"
          >
            <Icon size={15} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PlatformWorkspaceShell({ currentPage, pages, viewerEmail }: PlatformWorkspaceShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  if (!viewerEmail) {
    return <PlatformAuthGate />;
  }

  const viewerName = formatViewerName(viewerEmail);
  const initials = getInitials(viewerEmail);
  const relatedPages = pages
    .filter((page) => page.group === currentPage.group && page.slug.join("/") !== currentPage.slug.join("/"))
    .slice(0, 4);
  const quickLinks = [
    { label: "Create project", href: getDeveloperPortalPath(["projects"], "platform") },
    { label: "Issue API key", href: getDeveloperPortalPath(["api-keys"], "platform") },
    { label: "Run first test call", href: getDeveloperPortalPath(["playground"], "platform") },
    { label: "Review usage", href: getDeveloperPortalPath(["billing-usage"], "platform") },
  ];
  const workspaceMetrics = [
    { label: "Projects", value: "12", detail: "4 live, 8 sandbox" },
    { label: "API keys", value: "28", detail: "3 rotated this week" },
    { label: "Protected lookups", value: "84.2K", detail: "last 30 days" },
    { label: "Export jobs", value: "16", detail: "2 active right now" },
  ];
  const isDashboardView =
    currentPage.slug[0] === "platform-dashboard" ||
    currentPage.slug[0] === "account-access" ||
    currentPage.slug[0] === "quickstarts";

  return (
    <div className="platform-workspace-shell">
      <header className="platform-workspace-topbar">
        <div className="platform-workspace-brand">
          <Link className="platform-workspace-brand-link" href={buildHostedHref("platform")}>
            <span className="platform-workspace-brand-mark">P</span>
            <span>PayToCommit Platform for Developers</span>
          </Link>
          <div className="platform-workspace-breadcrumbs">
            <span>PayToCommit</span>
            <span>/</span>
            <span>PayToCommit Production</span>
          </div>
        </div>

        <div className="platform-workspace-topnav">
          <Link className={`platform-workspace-toplink${isDashboardView ? " is-active" : ""}`} href={buildHostedHref("platform")}>
            Dashboard
          </Link>
          <Link
            className={`platform-workspace-toplink${!isDashboardView ? " is-active" : ""}`}
            href={buildHostedHref("developers", getDeveloperPortalPath(["reference"], "developers"))}
            target="_blank"
          >
            API Docs
          </Link>

          <div className="platform-workspace-profile" ref={menuRef}>
            <button
              aria-label="Platform settings"
              className="platform-workspace-icon-button"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              <Settings size={18} />
            </button>
            <button
              aria-label="Open profile menu"
              className="platform-workspace-avatar"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {initials}
            </button>

            {menuOpen ? (
              <div className="platform-profile-menu">
                <div className="platform-profile-header">
                  <strong>{viewerName}</strong>
                  <span>{viewerEmail}</span>
                </div>
                <PlatformAppearanceMenu />
                <nav className="platform-profile-links">
                  <Link href={getDeveloperPortalPath(["account-access"], "platform")}>Your Profile</Link>
                  <Link href={buildHostedHref("paytocommit", "/legal")}>Terms &amp; policies</Link>
                  <Link href={buildHostedHref("paytocommit", "/help-center")}>Help</Link>
                </nav>
                <LogoutButton className="platform-profile-logout" redirectTo={buildHostedHref("platform")} />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="platform-workspace-layout">
        <aside className="platform-workspace-sidebar">
          {platformSidebarGroups.map((group) => (
            <section key={group.label} className="platform-sidebar-section">
              <span className="platform-sidebar-label">{group.label}</span>
              <div className="platform-sidebar-list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPage.slug[0] === item.slug[0];
                  return (
                    <Link
                      key={item.slug.join("/")}
                      className={`platform-sidebar-link${active ? " is-active" : ""}`}
                      href={getDeveloperPortalPath(item.slug, "platform")}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </aside>

        <main className="platform-workspace-main">
          <section className="platform-workspace-hero">
            <div className="platform-workspace-hero-copy">
              <span className="platform-workspace-eyebrow">{currentPage.group}</span>
              <h1>{currentPage.title}</h1>
              <p>{currentPage.summary}</p>
              <div className="platform-workspace-hero-actions">
                <Link className="platform-workspace-hero-primary" href={getDeveloperPortalPath(["api-keys"], "platform")}>
                  Create API key
                </Link>
                <Link
                  className="platform-workspace-hero-secondary"
                  href={buildHostedHref("developers", getDeveloperPortalPath(["reference"], "developers"))}
                  target="_blank"
                >
                  Open API docs
                </Link>
              </div>
            </div>
            <div className="platform-workspace-search">
              <Search size={16} />
              <span>Search projects, customers, usage, billing, payroll, and audit trails</span>
            </div>
          </section>

          <section className="platform-workspace-metrics">
            {workspaceMetrics.map((metric) => (
              <article key={metric.label} className="platform-workspace-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </section>

          <div className="platform-workspace-content">
            <article className="platform-workspace-article">
              <div className="platform-workspace-card">
                <div className="platform-workspace-card-header">
                  <span className="mono-label">{currentPage.eyebrow}</span>
                  <Link href={buildHostedHref("developers", getDeveloperPortalPath(currentPage.slug, "developers"))} target="_blank">
                    Read public docs
                  </Link>
                </div>
                <h2>{currentPage.title}</h2>
                <p>{currentPage.summary}</p>
              </div>

              {currentPage.sections.map((section) => (
                <section key={section.id} className="platform-workspace-section">
                  <h3>{section.title}</h3>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}

              {currentPage.codeSample ? (
                <section className="platform-workspace-code">
                  <div className="platform-workspace-code-header">
                    <strong>{currentPage.codeSample.title}</strong>
                    <span>{currentPage.codeSample.language}</span>
                  </div>
                  <pre>{currentPage.codeSample.code}</pre>
                  {currentPage.codeSample.note ? <p>{currentPage.codeSample.note}</p> : null}
                </section>
              ) : null}
            </article>

            <aside className="platform-workspace-rail">
              <section className="platform-workspace-panel">
                <div className="platform-workspace-panel-header">
                  <span className="mono-label">Workspace actions</span>
                  <BookOpenText size={15} />
                </div>
                <div className="platform-workspace-action-list">
                  {quickLinks.map((link) => (
                    <Link key={link.label} className="platform-workspace-action" href={link.href}>
                      <span>{link.label}</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  ))}
                </div>
              </section>

              {relatedPages.length ? (
                <section className="platform-workspace-panel">
                  <div className="platform-workspace-panel-header">
                    <span className="mono-label">Related pages</span>
                    <FileText size={15} />
                  </div>
                  <div className="platform-workspace-related">
                    {relatedPages.map((page) => (
                      <Link key={page.slug.join("/")} className="platform-workspace-related-item" href={getDeveloperPortalPath(page.slug, "platform")}>
                        <strong>{page.title}</strong>
                        <span>{page.summary}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="platform-workspace-panel">
                <div className="platform-workspace-panel-header">
                  <span className="mono-label">Operator checklist</span>
                  <BriefcaseBusiness size={15} />
                </div>
                <div className="platform-workspace-checklist">
                  <div className="platform-workspace-checkitem is-complete">
                    <strong>Organization ready</strong>
                    <span>Domain verified and admin seats confirmed.</span>
                  </div>
                  <div className="platform-workspace-checkitem is-complete">
                    <strong>Projects active</strong>
                    <span>Sandbox and production lanes are provisioned.</span>
                  </div>
                  <div className="platform-workspace-checkitem">
                    <strong>Usage review due</strong>
                    <span>Review billing, quotas, and protected lookup growth this week.</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
