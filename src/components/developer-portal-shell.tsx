"use client";

import Link from "next/link";
import { BellDot, ChevronDown, ChevronRight, KeyRound, Search, ShieldCheck, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { BrandLockup } from "@/components/brand-mark";
import { DocsAiAssistant } from "@/components/docs-ai-assistant";
import {
  getDeveloperPortalPath,
  getDeveloperPortalSearchResults,
} from "@/lib/developer-platform-content";
import type { DocPage, GalactusAccessState } from "@/lib/types";

function getPageKey(slug: string[]) {
  return slug.join("/");
}

export function DeveloperPortalShell({
  currentPage,
  pages,
  hostMode,
  galactusAccess,
  searchQuery,
  viewerEmail,
}: {
  currentPage: DocPage;
  pages: DocPage[];
  hostMode: "path" | "developers" | "platform";
  galactusAccess: GalactusAccessState;
  searchQuery?: string;
  viewerEmail: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchQuery ?? "");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    pages.reduce<Record<string, boolean>>((groups, page) => {
      groups[page.group] = true;
      return groups;
    }, {}),
  );
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const homeHref = getDeveloperPortalPath([], hostMode);
  const searchResults = useMemo(() => getDeveloperPortalSearchResults(deferredQuery), [deferredQuery]);
  const resultCountLabel = normalizedQuery ? `${searchResults.length} matches` : `${pages.length} pages`;
  const groupCounts = useMemo(() => {
    return pages.reduce<Record<string, number>>((counts, page) => {
      counts[page.group] = (counts[page.group] ?? 0) + 1;
      return counts;
    }, {});
  }, [pages]);
  const filteredPages = useMemo(() => {
    if (!normalizedQuery) {
      return pages;
    }
    const keys = new Set(searchResults.map((result) => getPageKey(result.slug)));
    return pages.filter((page) => keys.has(getPageKey(page.slug)));
  }, [normalizedQuery, pages, searchResults]);
  const groupedPages = useMemo(() => {
    return filteredPages.reduce<Record<string, DocPage[]>>((groups, page) => {
      const next = groups[page.group] ?? [];
      next.push(page);
      groups[page.group] = next;
      return groups;
    }, {});
  }, [filteredPages]);
  const currentPageKey = getPageKey(currentPage.slug);
  const relatedPages = useMemo(() => {
    return pages
      .filter((page) => page.group === currentPage.group && getPageKey(page.slug) !== getPageKey(currentPage.slug))
      .slice(0, 4);
  }, [currentPage, pages]);

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

  const headingLabel = hostMode === "platform" ? "Platform" : "Developers";
  const title =
    hostMode === "platform"
      ? "PAYTOCOMMIT PLATFORM"
      : "PAYTOCOMMIT DEVELOPER PLATFORM";
  const subtitle =
    hostMode === "platform"
      ? "Workspace sign-in, organizations, projects, API keys, playground calls, billing usage, exports, and HRS customer history in one platform workspace."
      : "Quickstarts, HRS API reference, webhook verification, workspace setup, dashboard usage, exports, billing, and enterprise setup in one developer hub.";
  const isAuthenticated = Boolean(viewerEmail);
  const searchPlaceholder =
    hostMode === "platform"
      ? "Search workspaces, projects, keys, playground calls, billing, and dashboard guides..."
      : "Search quickstarts, endpoints, billing, exports, and dashboard guides...";
  const hostHomeHref =
    hostMode === "platform"
      ? "https://platform.paytocommit.com"
      : hostMode === "developers"
        ? "https://developers.paytocommit.com"
        : "/developers";
  const companionHostHref =
    hostMode === "platform" ? "https://developers.paytocommit.com" : "https://platform.paytocommit.com";
  const companionHostLabel = hostMode === "platform" ? "Open developer docs" : "Open platform workspace";
  const operatorMetrics =
    hostMode === "platform"
      ? [
          {
            label: "Projects",
            value: isAuthenticated ? "3 active" : "Create the first one",
            detail: isAuthenticated
              ? "Sandbox, production, and one reporting workspace are ready to use."
              : "Create one sandbox project first, then add production after review.",
          },
          {
            label: "Keys",
            value: isAuthenticated ? "4 named keys" : "Server-only secrets",
            detail: isAuthenticated
              ? "Named keys, rotation windows, and usage traces stay scoped to the workspace."
              : "Keys are created after the workspace and project exist.",
          },
          {
            label: "Usage",
            value: isAuthenticated ? "11,284 lookups" : "Usage meter ready",
            detail: isAuthenticated
              ? "Lookup volume, export jobs, and webhook retries stay visible in one dashboard."
              : "Usage, audit, and billing views appear as soon as the first request lands.",
          },
        ]
      : [
          {
            label: "Reference",
            value: "HRS API + webhooks",
            detail: "Quickstarts, scopes, signatures, billing, and troubleshooting stay readable before sign-in.",
          },
          {
            label: "Workspace",
            value: isAuthenticated ? "Ready to open" : "Account first",
            detail: isAuthenticated
              ? "Jump straight into projects, keys, and the playground from the platform host."
              : "Create a developer account, then open the platform workspace.",
          },
          {
            label: "Operations",
            value: "Audit + reports",
            detail: "Reporting, webhook health, organization usage, and customer drill-downs live in the platform workspace.",
          },
        ];
  const onboardingSteps = [
    {
      label: "Create account",
      detail: "Use standard PayToCommit auth to open the workspace.",
      href: getDeveloperPortalPath(["account-access", "first-workspace-run"], hostMode),
    },
    {
      label: "Create organization",
      detail: "Set the company name, use case, and access owners.",
      href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
    },
    {
      label: "Create sandbox project",
      detail: "Separate the first integration from future production traffic.",
      href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
    },
    {
      label: "Request sandbox",
      detail: "Get the first approved key, test subjects, and webhook access.",
      href: getDeveloperPortalPath(["sandbox-access", "workforce-vetting"], hostMode),
    },
    {
      label: "Name the first API key",
      detail: "Create one server-side key tied to the sandbox project.",
      href: getDeveloperPortalPath(["api-keys", "hrs-sandbox-backend"], hostMode),
    },
    {
      label: "Run a test call",
      detail: "Inspect the HRS response and the audit trace in the playground.",
      href: getDeveloperPortalPath(["playground"], hostMode),
    },
    {
      label: "Request production",
      detail: "Move into billing, webhooks, reports, and production review.",
      href: getDeveloperPortalPath(["production-review", "northstar-live-review"], hostMode),
    },
  ];
  const currentOnboardingStep = useMemo(() => {
    if (hostMode !== "platform") {
      return -1;
    }
    if (!isAuthenticated) {
      return 0;
    }
    if (currentPageKey.startsWith("account-access")) {
      return 0;
    }
    if (currentPageKey.startsWith("organizations")) {
      return 1;
    }
    if (currentPageKey.startsWith("projects")) {
      return 2;
    }
    if (currentPageKey.startsWith("sandbox-access")) {
      return 3;
    }
    if (currentPageKey.startsWith("api-keys")) {
      return 4;
    }
    if (currentPageKey === "playground") {
      return 5;
    }
    if (
      currentPageKey.startsWith("production-review") ||
      currentPageKey === "platform-dashboard" ||
      currentPageKey.startsWith("customers") ||
      currentPageKey.startsWith("reports") ||
      currentPageKey.startsWith("billing-usage") ||
      currentPageKey.startsWith("audit-logs") ||
      currentPageKey.startsWith("workforce-rollout") ||
      currentPageKey.startsWith("employee-invites") ||
      currentPageKey.startsWith("company-email-access") ||
      currentPageKey.startsWith("organization-onboarding") ||
      currentPageKey.startsWith("managed-visibility") ||
      currentPageKey.startsWith("continuity-access") ||
      currentPageKey.startsWith("employee-access-queue") ||
      currentPageKey.startsWith("employees") ||
      currentPageKey.startsWith("payroll-and-wallet")
    ) {
      return 6;
    }
    return 1;
  }, [currentPageKey, hostMode, isAuthenticated]);
  const platformSurfaceCards = [
    {
      href: getDeveloperPortalPath(["workforce-rollout"], hostMode),
      label: "Workforce",
      title: "Employee rollout",
      detail: "Invite employees by company email, run company-specific onboarding, and track rollout readiness.",
    },
    {
      href: getDeveloperPortalPath(["employee-invites"], hostMode),
      label: "Invites",
      title: "Invite employees",
      detail: "Send single, bulk, and CSV-backed company-email invites with role templates and onboarding mappings.",
    },
    {
      href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
      label: "Onboarding",
      title: "Managed employee onboarding",
      detail: "Disclose role, visibility policy, and workspace routing before the employee enters the organization view.",
    },
    {
      href: getDeveloperPortalPath(["company-email-access"], hostMode),
      label: "States",
      title: "Company-email access",
      detail: "Track invited, pending, continuity, and blocked employee states without losing approval context.",
    },
    {
      href: getDeveloperPortalPath(["managed-visibility"], hostMode),
      label: "Visibility",
      title: "Managed visibility policy",
      detail: "Disclose exactly what the organization can review and keep template changes auditable.",
    },
    {
      href: getDeveloperPortalPath(["continuity-access"], hostMode),
      label: "Continuity",
      title: "Restore active access safely",
      detail: "Preserve proof, deadline, and market access when broader organization permissions are being reduced.",
    },
    {
      href: getDeveloperPortalPath(["organization-workspace"], hostMode),
      label: "Workspace",
      title: "Run the org workspace",
      detail: "Keep approvals, org markets, payroll rollout, and continuity protections in one operator console.",
    },
    {
      href: getDeveloperPortalPath(["manager-views"], hostMode),
      label: "Managers",
      title: "Manager team lanes",
      detail: "Give managers roster, deadline, and org-market visibility without collapsing into full admin access.",
    },
    {
      href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
      label: "Access",
      title: "Approval queue",
      detail: "Approve employee requests, review pending signups, and apply revocation safeguards with a recorded reason.",
    },
    {
      href: getDeveloperPortalPath(["employees"], hostMode),
      label: "People",
      title: "Employee directory",
      detail: "Search employees, open person-level detail, and review role, access, payroll, and commitment posture.",
    },
    {
      href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
      label: "Payroll",
      title: "Direct deposit and wallet",
      detail: "Review payroll-linked funding, wallet rules, and employer-side reporting for the Commitment Wallet.",
    },
    {
      href: getDeveloperPortalPath(["customers"], hostMode),
      label: "Customers",
      title: "Portfolio and drill-down",
      detail: "Consent-scoped customer records, trend history, and reliability events.",
    },
    {
      href: getDeveloperPortalPath(["reports"], hostMode),
      label: "Reports",
      title: "Exports and cohorts",
      detail: "Scheduled reports, compliance packages, and historical snapshots.",
    },
    {
      href: getDeveloperPortalPath(["billing-usage"], hostMode),
      label: "Billing",
      title: "Usage and invoice preview",
      detail: "Metered lookup volume, report costs, and project-by-project billing visibility.",
    },
    {
      href: getDeveloperPortalPath(["organization-fees"], hostMode),
      label: "Economics",
      title: "Employer program economics",
      detail: "Keep organization program fees and revenue-share lanes separate from core platform billing.",
    },
    {
      href: getDeveloperPortalPath(["audit-logs"], hostMode),
      label: "Audit",
      title: "Access history",
      detail: "Consent changes, key usage, export history, and sensitive admin actions.",
    },
    {
      href: getDeveloperPortalPath(["strategic-partners"], hostMode),
      label: "Partners",
      title: "Flagship rollout",
      detail: "Optional co-branded launches, case studies, and strategic partner packages.",
    },
  ];
  const workspaceHealthCards = [
    {
      label: "Organizations",
      value: isAuthenticated ? "2 active" : "Create the first one",
      detail: isAuthenticated
        ? "One live org and one staging org are keeping project access and billing clean."
        : "Start by naming the first organization and assigning technical plus billing owners.",
    },
    {
      label: "Protected keys",
      value: isAuthenticated ? "4 healthy" : "No key yet",
      detail: isAuthenticated
        ? "All active keys are server-side, named, and tied to one project each."
        : "Create the first sandbox key after the project is approved.",
    },
    {
      label: "Webhook health",
      value: isAuthenticated ? "99.98% delivered" : "Waiting on first endpoint",
      detail: isAuthenticated
        ? "Retries, signatures, and event delivery stay visible without leaving the workspace."
        : "Webhook monitoring appears after the first endpoint is connected.",
    },
    {
      label: "Export jobs",
      value: isAuthenticated ? "3 recent" : "No export history",
      detail: isAuthenticated
        ? "Scheduled reports and compliance packages are ready to download from the reporting lane."
        : "Exports will appear once the first consent-scoped lookup lands in the workspace.",
    },
    {
      label: "Employee approvals",
      value: isAuthenticated ? "18 pending" : "Queue opens after org setup",
      detail: isAuthenticated
        ? "Company-email requests, role checks, and temporary restrictions can all be reviewed from one queue."
        : "The workforce queue appears once the first organization and company-email policy are in place.",
    },
    {
      label: "Payroll adoption",
      value: isAuthenticated ? "64% enrolled" : "Optional rollout",
      detail: isAuthenticated
        ? "Direct-deposit enrollment and wallet-linked funding stay visible beside billing and audit history."
        : "Payroll-linked wallet funding can be turned on when the organization is ready.",
    },
  ];
  const customerPortfolio = [
    {
      name: "Prime hiring cohort",
      detail: "142 consent-backed candidates with a stable upward trend and one flagged recovery lane.",
      href: getDeveloperPortalPath(["customers"], hostMode),
    },
    {
      name: "Underwriting review queue",
      detail: "38 customer profiles awaiting final policy review after sandbox lookups cleared.",
      href: getDeveloperPortalPath(["customers"], hostMode),
    },
    {
      name: "Partner operations segment",
      detail: "12 active partner records with strong webhook health and no consent-expiry alerts.",
      href: getDeveloperPortalPath(["reports"], hostMode),
    },
  ];
  const workforcePortfolio = [
    {
      name: "Invite batches",
      detail: "3 active company-email waves are split by team, role template, and onboarding track.",
      href: getDeveloperPortalPath(["employee-invites"], hostMode),
    },
    {
      name: "Pending employee access",
      detail: "18 company-email signups are waiting on approval, with 4 requiring role review before activation.",
      href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
    },
    {
      name: "Employee directory",
      detail: "842 company-managed employee records are searchable across role, team, manager, and access state.",
      href: getDeveloperPortalPath(["employees"], hostMode),
    },
    {
      name: "Payroll-linked rollout",
      detail: "84 employees have an active wallet funding path and 11 still need payroll enrollment completed.",
      href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
    },
    {
      name: "Organization markets",
      detail: "27 internal commitment markets are active across onboarding, operations, and team delivery workflows.",
      href: getDeveloperPortalPath(["workforce-rollout"], hostMode),
    },
    {
      name: "Managed onboarding",
      detail: "The employee first-run path now discloses visibility scope, default workspace, and first program entry before activation.",
      href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
    },
    {
      name: "Organization workspace",
      detail: "Owners, queue pressure, active markets, team views, and payroll rollout now live in one company workspace.",
      href: getDeveloperPortalPath(["organization-workspace"], hostMode),
    },
    {
      name: "Manager team lanes",
      detail: "Managers can work from scoped team views with roster, deadlines, misses, and recoveries already grouped together.",
      href: getDeveloperPortalPath(["manager-views"], hostMode),
    },
    {
      name: "Continuity protection",
      detail: "7 employees still have protected access because active commitments and proof windows are still live.",
      href: getDeveloperPortalPath(["continuity-access"], hostMode),
    },
    {
      name: "Program economics",
      detail: "Employer-side program fees, payroll-linked line items, and revenue-share lanes are visible without mixing them into Sovereign Spark.",
      href: getDeveloperPortalPath(["organization-fees"], hostMode),
    },
  ];
  const workforceRolloutChecklist = [
    "Connect the company domain and role templates.",
    "Send company-email invites or upload the first roster.",
    "Map the managed onboarding template and visibility policy.",
    "Approve pending employee requests and resolve restricted cases.",
    "Publish organization markets and channel permissions.",
    "Turn on payroll-linked wallet funding when finance is ready.",
  ];
  const workspaceAlerts = [
    "One production key rotation window closes in 4 days.",
    "Billing review is ready for the next monthly export package.",
    "A sandbox report finished and is ready to download.",
    "12 employee-access requests have been waiting longer than 24 hours.",
  ];
  const keyHealth = [
    "hrs-sandbox-backend · healthy · last used 2m ago",
    "hrs-prod-workers · healthy · last used 9m ago",
    "hrs-prod-risk-review · rotate in 4 days",
  ];
  const pageContextCards: Record<
    string,
    Array<{ label: string; value: string; detail: string }>
  > = {
    "platform-dashboard": [
      {
        label: "Queried customers",
        value: "142 active",
        detail: "The dashboard keeps the customer portfolio, alerts, and consent-backed trend review in one operating surface.",
      },
      {
        label: "Exports waiting",
        value: "2 packages",
        detail: "Finance and compliance can pick up pending export jobs without leaving the workspace dashboard.",
      },
      {
        label: "Approval queue",
        value: "18 pending",
        detail: "Employee access requests remain visible beside usage, billing, and key health.",
      },
    ],
    customers: [
      {
        label: "Recoveries flagged",
        value: "4 profiles",
        detail: "Customer drill-down highlights recent recoveries so teams can inspect what changed instead of relying on a flat score.",
      },
      {
        label: "Consent expiring",
        value: "3 soon",
        detail: "Operators can act on soon-to-expire scopes before portfolio visibility disappears unexpectedly.",
      },
      {
        label: "Trend lanes",
        value: "Rise · Plateau · Recovery",
        detail: "The customer page is designed for trajectory review, not just a single score snapshot.",
      },
    ],
    "customers/sovereign-node-1184": [
      {
        label: "Current HRS",
        value: "812 · Recovering",
        detail: "The subject page opens on trajectory first so operators can explain the score before they act on it.",
      },
      {
        label: "Scope expiry",
        value: "20 days",
        detail: "Consent timing stays visible on the detail page so operators do not overrun the approved view window.",
      },
      {
        label: "Timeline density",
        value: "18 events",
        detail: "Recoveries, declines, and consent changes stay in one operator-grade event lane.",
      },
    ],
    reports: [
      {
        label: "Scheduled reports",
        value: "7 active",
        detail: "Weekly portfolio summaries, audit packages, and monthly billing reports stay visible from one report lane.",
      },
      {
        label: "Delivery status",
        value: "3 preparing",
        detail: "Report state stays explicit so teams can see delivered, retrying, and correction-required jobs clearly.",
      },
      {
        label: "Export formats",
        value: "CSV + PDF",
        detail: "Reports stay operational for both machine workflows and finance/compliance review.",
      },
    ],
    "reports/compliance-audit-package": [
      {
        label: "Workflow state",
        value: "Preparing",
        detail: "The report detail lane shows delivery state, correction readiness, and export context instead of a single generic status badge.",
      },
      {
        label: "Delivery target",
        value: "Compliance mailbox",
        detail: "The operator sees exactly who receives the package and when the last successful handoff landed.",
      },
      {
        label: "Correction window",
        value: "Open",
        detail: "If a package needs to be corrected, the report detail lane keeps that path visible and auditable.",
      },
    ],
    "reports/operations-digest": [
      {
        label: "Digest cadence",
        value: "Weekly · Monday 8:00 AM",
        detail: "The operations digest should show its delivery rhythm because leaders depend on it as a management report.",
      },
      {
        label: "Coverage",
        value: "Queue · Markets · Payroll · Teams",
        detail: "The report should make its operating scope visible before the user downloads it or schedules another run.",
      },
      {
        label: "Current delivery",
        value: "Preparing next digest",
        detail: "A digest is still a real workflow with a visible next run, not a static export template.",
      },
    ],
    "reports/billing-reconciliation": [
      {
        label: "Reconciliation run",
        value: "Month-to-date",
        detail: "The billing-close page should open on the active statement window so finance and operations are reading the same frame.",
      },
      {
        label: "Open exceptions",
        value: "2 active items",
        detail: "Operators need the current mismatch count immediately instead of discovering it after drilling through exports.",
      },
      {
        label: "Correction posture",
        value: "Open",
        detail: "Reconciliation only feels production-grade when the correction lane is visible from the first screen.",
      },
    ],
    "organization-alerts/continuity-pressure": [
      {
        label: "Alert family",
        value: "Continuity pressure",
        detail: "The alert detail should name the exact employee-risk class instead of flattening it into a generic warning state.",
      },
      {
        label: "Employees at risk",
        value: "7 protected",
        detail: "This surface should show how many employees still depend on continuity access before any action is taken.",
      },
      {
        label: "Nearest deadline",
        value: "Mar 15 · 4:00 PM",
        detail: "Time-to-risk belongs on the first alert screen because it shapes the next intervention immediately.",
      },
    ],
    "audit-logs/organization-access-review": [
      {
        label: "Audit slice",
        value: "Organization access review",
        detail: "The audit detail should clearly state which access and visibility decisions are under review.",
      },
      {
        label: "Event density",
        value: "184 logged actions",
        detail: "Access review only feels operational when the page makes the recent decision volume visible right away.",
      },
      {
        label: "Export state",
        value: "Compliance ready",
        detail: "The operator should know whether this audit slice is already ready for export or correction from the first panel.",
      },
    ],
    "billing-usage": [
      {
        label: "Protected lookups",
        value: "11,284 this period",
        detail: "Usage billing remains tied to real operational primitives instead of seat counts or model-tier upsells.",
      },
      {
        label: "Largest project lane",
        value: "Production underwriting",
        detail: "The billing page should make spend concentration obvious before the invoice closes.",
      },
      {
        label: "Threshold watch",
        value: "2 alerts",
        detail: "Technical and finance owners can see the same usage pressure points from the same page.",
      },
    ],
    "billing-usage/production-underwriting": [
      {
        label: "Project concentration",
        value: "61% of spend",
        detail: "The detail page makes it obvious when one live project is carrying most of the monthly cost profile.",
      },
      {
        label: "Threshold alerts",
        value: "2 active",
        detail: "Project-level alerts stay close to the workflow mix so operators can act before the invoice closes.",
      },
      {
        label: "Largest workflow",
        value: "Protected lookup batch",
        detail: "Spend stays tied to the exact workflow driving it rather than disappearing into one opaque usage total.",
      },
    ],
    "workforce-rollout": [
      {
        label: "Active rollout plans",
        value: "3 live launches",
        detail: "Workforce rollout keeps company-email onboarding, employee approvals, and organization market readiness in one lane.",
      },
      {
        label: "Pending employee requests",
        value: "46 waiting",
        detail: "The rollout page stays tied to the queue pressure that still needs operator action before launch day.",
      },
      {
        label: "Payroll readiness",
        value: "38% wallet adoption",
        detail: "The launch path should show whether direct-deposit and wallet setup are keeping up with the employee rollout.",
      },
    ],
    "workforce-rollout/northstar-launch-q2": [
      {
        label: "Launch template",
        value: "northstar-launch-q2",
        detail: "The rollout detail page should make the active company onboarding template visible from the first screen.",
      },
      {
        label: "Invite batch",
        value: "840 employees",
        detail: "Batch size and pending approvals belong on the rollout detail page, not a hidden config lane.",
      },
      {
        label: "Next checkpoint",
        value: "Mar 18 · 1:00 PM",
        detail: "The launch owner should always know the next rollout checkpoint without opening a second planning tool.",
      },
    ],
    "employee-invites": [
      {
        label: "Active invite waves",
        value: "3 open batches",
        detail: "Invite operations should show live rollout batches instead of leaving email delivery as a hidden background task.",
      },
      {
        label: "CSV-ready rosters",
        value: "2 queued uploads",
        detail: "The invite page should make one-off and bulk invite entry equally visible.",
      },
      {
        label: "Delivery health",
        value: "97.9% delivered",
        detail: "Invite delivery belongs on the first screen because it directly shapes the approval queue that follows.",
      },
    ],
    "employee-invites/northstar-wave-3": [
      {
        label: "Invite batch",
        value: "northstar-wave-3",
        detail: "Batch detail should anchor delivery state and acceptance coverage around one named employee wave.",
      },
      {
        label: "Accepted",
        value: "162 employees",
        detail: "Invite acceptance should be visible without forcing the operator into a second reporting lane.",
      },
      {
        label: "Bounced",
        value: "5 emails",
        detail: "Bounce correction needs to stay explicit so operators can repair the roster quickly.",
      },
    ],
    "company-email-access": [
      {
        label: "Pending approvals",
        value: "18 live requests",
        detail: "Company-email access should show the current approval queue pressure and not hide it inside generic employee status copy.",
      },
      {
        label: "Blocked aliases",
        value: "3 active rules",
        detail: "The state system should show how many employees are being denied by explicit policy instead of only surfacing approved cases.",
      },
      {
        label: "Continuity-access users",
        value: "7 protected",
        detail: "Continuity access needs to remain visible because it changes what revocation actually means in practice.",
      },
    ],
    "company-email-access/pending-employer-approval": [
      {
        label: "Employee state",
        value: "Pending employer approval",
        detail: "The employee-side waiting state should stay explicit, calm, and actionable.",
      },
      {
        label: "Realtime sync",
        value: "Enabled",
        detail: "The employee should see when the organization queue updates without refreshing a dead-end page.",
      },
      {
        label: "Next action",
        value: "Request access again",
        detail: "A good pending state explains exactly what the employee can still do while waiting.",
      },
    ],
    "company-email-access/blocked-company-email": [
      {
        label: "Employee state",
        value: "Blocked by policy",
        detail: "Blocked state should stay respectful externally while preserving full internal auditability.",
      },
      {
        label: "Review source",
        value: "Admin policy",
        detail: "The internal cause belongs in the workspace, not in the employee-facing explanation.",
      },
      {
        label: "Recovery path",
        value: "Manual restore only",
        detail: "If the organization changes policy later, the restore path should stay one click away for the owner.",
      },
    ],
    "organization-onboarding": [
      {
        label: "Managed templates",
        value: "4 active",
        detail: "Organization onboarding should feel like a real first-run system with explicit templates and disclosure states.",
      },
      {
        label: "Default workspace",
        value: "Organization first",
        detail: "The employee should know which workspace opens first and why before activation completes.",
      },
      {
        label: "Visibility disclosure",
        value: "Auditable",
        detail: "Visibility policy needs to stay explicit because it changes what the employer can review.",
      },
    ],
    "organization-onboarding/northstar-managed-account": [
      {
        label: "Template",
        value: "northstar-managed-account",
        detail: "The detail page should anchor the actual onboarding template used by this organization.",
      },
      {
        label: "Role mapping",
        value: "Operations manager",
        detail: "Managed role assignment belongs on the first screen, not hidden in a secondary policy lane.",
      },
      {
        label: "First channels",
        value: "General · Results · Handoff audit",
        detail: "The new employee should know where the organization conversation starts the moment access is approved.",
      },
    ],
    "managed-visibility": [
      {
        label: "Active templates",
        value: "3 live policies",
        detail: "Visibility should be governed by named templates instead of being inferred from loose admin behavior.",
      },
      {
        label: "Disclosure state",
        value: "Auditable",
        detail: "Every managed visibility template should be tied to employee-facing disclosure and an audit trail.",
      },
      {
        label: "Default template",
        value: "Full managed account visibility",
        detail: "The workspace should make the current default posture obvious before any employee is onboarded.",
      },
    ],
    "managed-visibility/northstar-full-managed-visibility": [
      {
        label: "Template ID",
        value: "northstar-full-managed-visibility",
        detail: "A visibility detail page should stay anchored to one versioned policy object.",
      },
      {
        label: "Active employees",
        value: "716 managed accounts",
        detail: "The operator should know how much of the roster is currently governed by this template.",
      },
      {
        label: "Last disclosure",
        value: "Mar 10 · 11:06 AM",
        detail: "Disclosure timing belongs on the first screen because it is part of the policy contract.",
      },
    ],
    "continuity-access": [
      {
        label: "Protected employees",
        value: "7 active windows",
        detail: "Continuity access should stay measurable so operators can see exactly how many employees still need protection.",
      },
      {
        label: "Nearest restore deadline",
        value: "Mar 15 · 4:00 PM",
        detail: "The next required restore checkpoint belongs on the overview page, not hidden in one detail lane.",
      },
      {
        label: "Org trust pressure",
        value: "Elevated",
        detail: "Continuity issues should remain tied to the organization record where policy allows.",
      },
    ],
    "organization-workspace": [
      {
        label: "Active employees",
        value: "716 live",
        detail: "The workspace should open on the real managed employee cohort instead of a generic organization count.",
      },
      {
        label: "Current queue pressure",
        value: "46 pending approvals",
        detail: "Approval load belongs on the workspace home because it shapes the next operator action immediately.",
      },
      {
        label: "Active organization markets",
        value: "27 live",
        detail: "The workspace should keep organization-market volume visible beside queue and payroll posture.",
      },
    ],
    "organization-workspace/northstar-central-ops": [
      {
        label: "Owner map",
        value: "Tech · Workforce · Billing · Audit",
        detail: "The detail page should show the current owner chain before the operator reaches for any queue or employee action.",
      },
      {
        label: "Continuity windows",
        value: "7 protected",
        detail: "Protected employee cases stay part of the core workspace posture, not a hidden exception list.",
      },
      {
        label: "Next checkpoint",
        value: "Mar 18 · 1:00 PM",
        detail: "Workspace detail should always show the next operating checkpoint without another planning tool.",
      },
    ],
    "manager-views": [
      {
        label: "Manager-owned teams",
        value: "12 active lanes",
        detail: "Manager views should be tied to real team ownership boundaries instead of one generic directory lane.",
      },
      {
        label: "Pending manager reviews",
        value: "9 assigned",
        detail: "Approval and restore tasks that belong to managers should stay visible from the team view entry page.",
      },
      {
        label: "Missed commitments",
        value: "14 this period",
        detail: "Managers need recent misses in context so they can act on the right team pressure first.",
      },
    ],
    "manager-views/warehouse-operations": [
      {
        label: "Team size",
        value: "84 employees",
        detail: "A team detail page should open with the real roster size and not make the manager infer it from raw rows.",
      },
      {
        label: "Live commitments",
        value: "39 active",
        detail: "The current commitment load is the core operating context for this manager-owned team.",
      },
      {
        label: "Restoration risk",
        value: "2 continuity cases",
        detail: "Managers should see access-restoration pressure before it turns into a missed proof window.",
      },
    ],
    "continuity-access/jordan-lee-restriction-window": [
      {
        label: "Employee window",
        value: "jordan-lee-restriction-window",
        detail: "Restriction detail should anchor one continuity case rather than collapsing everything into a generic queue row.",
      },
      {
        label: "Active commitments",
        value: "4 live",
        detail: "The detail page must make the real continuity burden visible before any further restriction is approved.",
      },
      {
        label: "Proof risk",
        value: "1 proof window at risk",
        detail: "The operator should see exactly what is endangered if access is not restored in time.",
      },
    ],
    "employee-access-queue": [
      {
        label: "Pending approvals",
        value: "46 active",
        detail: "The queue keeps company-email requests readable even when rollout volume is high.",
      },
      {
        label: "Restricted with commitments",
        value: "7 employees",
        detail: "Temporary restrictions stay tied to active commitments so the operator can see who still needs restored access.",
      },
      {
        label: "Bulk-safe approvals",
        value: "29 requests",
        detail: "The platform should make safe bulk approvals obvious instead of forcing repetitive hand review.",
      },
    ],
    "employee-access-queue/northstar-q1-access-window": [
      {
        label: "Queue window",
        value: "Q1 access window",
        detail: "The detail page should show exactly which approval wave the operator is reviewing.",
      },
      {
        label: "Nearest restore deadline",
        value: "Mar 15 · 4:00 PM",
        detail: "Restriction windows with active commitments need a visible restoration deadline before proof windows close.",
      },
      {
        label: "Org trust pressure",
        value: "Elevated",
        detail: "The queue detail should make clear when approval delays are beginning to affect the organization record.",
      },
    ],
    employees: [
      {
        label: "Active employees",
        value: "716 records",
        detail: "The directory should open with live employee volume, not a generic people stub.",
      },
      {
        label: "Pending approvals",
        value: "46 waiting",
        detail: "Operators need approval pressure visible beside the employee roster itself.",
      },
      {
        label: "Continuity access",
        value: "7 protected",
        detail: "Employees with live commitments stay visible as a protected subgroup instead of disappearing into queue-only views.",
      },
    ],
    "employees/jordan-lee": [
      {
        label: "Role and team",
        value: "Manager · Warehouse Operations",
        detail: "Employee detail should open on responsibility and team context before deeper metrics.",
      },
      {
        label: "Access state",
        value: "Active",
        detail: "The current employee access posture must stay obvious before any policy action is taken.",
      },
      {
        label: "Current commitments",
        value: "4 live",
        detail: "The person-level page should keep the active commitment load on the first screen.",
      },
    ],
    "payroll-and-wallet": [
      {
        label: "Direct-deposit adoption",
        value: "312 active",
        detail: "Payroll-linked wallet setup should remain visible beside queue and rollout health, not buried in finance-only screens.",
      },
      {
        label: "Linked payout rails",
        value: "208 connected",
        detail: "The payroll lane should show whether payout rails are keeping pace with wallet adoption.",
      },
      {
        label: "Wallet boundary",
        value: "Employee-controlled",
        detail: "Employers can review payroll adoption, but the Commitment Wallet keeps its own password, biometric, and Continuity Key rules.",
      },
    ],
    "payroll-and-wallet/northstar-direct-deposit-rollout": [
      {
        label: "Program state",
        value: "Active",
        detail: "The payroll detail should open on the real program state instead of a generic enablement badge.",
      },
      {
        label: "Opt-in rate",
        value: "38%",
        detail: "Wallet adoption should stay measurable from the same detail lane that owns the rollout.",
      },
      {
        label: "Next payroll window",
        value: "Mar 15 · 9:00 AM",
        detail: "Finance and operations should both see the next funding window without jumping into another tool.",
      },
    ],
    "organization-fees": [
      {
        label: "Program fee posture",
        value: "Separate from Sovereign Spark",
        detail: "The organization fee lane should make the employer-side economics boundary obvious from the first screen.",
      },
      {
        label: "Payroll-linked programs",
        value: "1 active",
        detail: "Program economics should stay tied to the payroll and organization-market lanes it supports.",
      },
      {
        label: "Monthly program total",
        value: "$4.2k",
        detail: "Operators should see the current employer-side economics shape without opening a full invoice export first.",
      },
    ],
    "organization-fees/northstar-program-share": [
      {
        label: "Agreement state",
        value: "Contract-backed",
        detail: "The detail page should make it obvious that this is a negotiated organization-program layer and not a generic platform fee.",
      },
      {
        label: "Revenue-share mode",
        value: "Enabled",
        detail: "The active commercial mode belongs on the first screen so finance and operations are reading the same truth.",
      },
      {
        label: "Linked rollout",
        value: "Northstar direct deposit",
        detail: "The economics page should keep its payroll and workforce context attached instead of turning into a detached invoice view.",
      },
    ],
    "roles-permissions/manager-control-pack": [
      {
        label: "Template scope",
        value: "Manager + analyst controls",
        detail: "The role template detail should make its actual operating boundary obvious before it is assigned to a live team lane.",
      },
      {
        label: "Queue authority",
        value: "Approve + restore",
        detail: "This control pack governs approval and continuity actions, so the page should surface that power directly.",
      },
      {
        label: "Audit requirement",
        value: "Always on",
        detail: "Permission changes tied to this pack remain traceable because they affect access, visibility, and live commitments.",
      },
    ],
    "organizations/northstar-logistics": [
      {
        label: "Workspace state",
        value: "Production-ready",
        detail: "The organization detail should show the current operating posture before an owner opens any project or export.",
      },
      {
        label: "Linked rollouts",
        value: "3 active",
        detail: "Organization detail should keep workforce launches and payroll-linked programs in the same lane as project ownership.",
      },
      {
        label: "Owners assigned",
        value: "Technical · Billing · Audit · Workforce",
        detail: "The detail page needs the real owner map, not just a generic members list.",
      },
    ],
    "projects/sandbox-workforce-review": [
      {
        label: "Environment",
        value: "Sandbox",
        detail: "The project detail should make the environment boundary obvious before anyone touches the serving key.",
      },
      {
        label: "Serving assets",
        value: "2 keys · 3 webhooks",
        detail: "Keys and endpoints should stay visible from the project lane that owns them.",
      },
      {
        label: "Promotion state",
        value: "Ready for review",
        detail: "The operator should know whether the project is still experimental or ready to move forward.",
      },
    ],
    "api-keys/hrs-sandbox-backend": [
      {
        label: "Scope",
        value: "hrs.lookup.identity",
        detail: "A key detail view should make its permitted scope visible before the operator rotates or reuses it.",
      },
      {
        label: "Last used",
        value: "Mar 12 · 2:18 PM",
        detail: "Last successful use belongs on the key detail page itself, not only in audit logs.",
      },
      {
        label: "Rotation due",
        value: "22 days",
        detail: "Rotation timing should be part of the key's first-screen health check.",
      },
    ],
    "account-access": [
      {
        label: "Workspace path",
        value: "Account → org → project",
        detail: "The account-access page should show the exact operator path from first sign-in to a real workspace.",
      },
      {
        label: "Pending attaches",
        value: "2 organizations",
        detail: "The platform should make it obvious when an account is still waiting to be attached to the correct organization.",
      },
      {
        label: "Next action",
        value: "Open first workspace run",
        detail: "Onboarding should always point to the exact next lane instead of leaving the user on a generic summary page.",
      },
    ],
    "account-access/first-workspace-run": [
      {
        label: "Viewer role",
        value: "Technical owner",
        detail: "The first workspace run should make the operator role explicit from the moment the account attaches to the workspace.",
      },
      {
        label: "Attach state",
        value: "Complete",
        detail: "The detail page should show whether organization attachment is done before the user reaches projects or keys.",
      },
      {
        label: "First-hour path",
        value: "Project → key → lookup",
        detail: "The workspace onboarding path should stay visible while the user moves through setup.",
      },
    ],
    "quickstarts": [
      {
        label: "First lookup path",
        value: "Sandbox → key → webhook",
        detail: "Quickstarts should behave like real operator runbooks, not a loose collection of docs pages.",
      },
      {
        label: "Verified samples",
        value: "3 active guides",
        detail: "The quickstart lane should tell the operator how many verified launch paths already exist.",
      },
      {
        label: "Next action",
        value: "Run first protected lookup",
        detail: "The page should make the immediate action obvious without sending the user back to the overview.",
      },
    ],
    "quickstarts/first-protected-lookup": [
      {
        label: "Lookup state",
        value: "Verified",
        detail: "The detail page should show whether the first protected lookup has already passed and which step comes next.",
      },
      {
        label: "Webhook check",
        value: "Passed",
        detail: "A first-lookup quickstart should stay tied to the webhook check that proves the integration is really alive.",
      },
      {
        label: "Next handoff",
        value: "Production review",
        detail: "Once the basics are proven, the page should point directly at the release lane.",
      },
    ],
    "sandbox-access": [
      {
        label: "Requests under review",
        value: "4 active",
        detail: "Sandbox approval should feel like a real queue with clear blocking checks, not a hidden email process.",
      },
      {
        label: "Typical traffic band",
        value: "2k–5k monthly",
        detail: "Expected usage belongs in the sandbox lane because it shapes both approval and later billing expectations.",
      },
      {
        label: "Next action",
        value: "Open sandbox detail",
        detail: "The operator should be able to move directly into a real request detail view from the summary page.",
      },
    ],
    "sandbox-access/workforce-vetting": [
      {
        label: "Request state",
        value: "Under review",
        detail: "The detail page should show the actual approval state before the team starts waiting on email threads.",
      },
      {
        label: "Traffic band",
        value: "2k–5k monthly",
        detail: "Projected protected usage should remain visible on the request itself.",
      },
      {
        label: "Blocking checks",
        value: "2 remaining",
        detail: "The operator should know exactly what is still preventing sandbox approval.",
      },
    ],
    "production-review": [
      {
        label: "Live reviews",
        value: "2 pending",
        detail: "Production review should stay visible as a real go-live queue, not a hidden internal checklist.",
      },
      {
        label: "Critical checks",
        value: "Consent · webhooks · billing",
        detail: "The production lane should foreground the checks that actually decide whether traffic can go live.",
      },
      {
        label: "Next action",
        value: "Open live review",
        detail: "The page should point straight to the current release lane instead of sending the user through multiple summaries.",
      },
    ],
    "production-review/northstar-live-review": [
      {
        label: "Review state",
        value: "Waiting on final webhook check",
        detail: "The detail page should show the actual release blocker instead of a vague pending badge.",
      },
      {
        label: "Billing owner",
        value: "Confirmed",
        detail: "Billing readiness should be visible on the same screen as consent and webhook checks.",
      },
      {
        label: "Key hygiene",
        value: "Healthy",
        detail: "The operator should not have to open another surface to confirm the serving key posture.",
      },
    ],
    organizations: [
      {
        label: "Workspace ownership",
        value: "Technical + billing + audit",
        detail: "The organization page should make owner setup legible before any project, key, or report exists.",
      },
      {
        label: "Pending invites",
        value: "6 owners",
        detail: "Organization setup is the first real control surface, not a throwaway settings form.",
      },
      {
        label: "Policy state",
        value: "Sandbox-ready",
        detail: "Teams should know when the org is ready for projects, keys, and protected usage without guessing.",
      },
    ],
    projects: [
      {
        label: "Sandbox lanes",
        value: "2 active",
        detail: "Projects split environments and workloads cleanly so usage, keys, and reports stay explainable.",
      },
      {
        label: "First production path",
        value: "Review pending",
        detail: "The project page should keep the production handoff visible from the same setup flow.",
      },
      {
        label: "Webhook coverage",
        value: "3 endpoints",
        detail: "Project setup should stay tied to the endpoints and events it actually powers.",
      },
    ],
    "api-keys": [
      {
        label: "Named keys",
        value: "4 server-side",
        detail: "Keys should be named for the exact project and workload they serve, never treated like unlabeled secrets.",
      },
      {
        label: "Last rotation",
        value: "8 days ago",
        detail: "Rotation health belongs on the key page itself so operators can act without leaving the setup lane.",
      },
      {
        label: "Unused keys",
        value: "1 stale",
        detail: "The key page should make cleanup as visible as issuance.",
      },
    ],
    playground: [
      {
        label: "Latest test call",
        value: "Scope verified",
        detail: "The playground exists to prove the response, scope, and audit trace are all correct before live traffic starts.",
      },
      {
        label: "Webhook trace",
        value: "Healthy",
        detail: "Test calls and signed event verification should stay in the same operator lane.",
      },
      {
        label: "Promotion path",
        value: "Production-ready",
        detail: "A good playground page makes the next production-review step obvious instead of sending teams back into docs.",
      },
    ],
  };
  const activePageContextCards = pageContextCards[currentPageKey] ?? [];
  const pageWorkbenchPanels: Record<
    string,
    Array<{
      title: string;
      eyebrow: string;
      items: Array<{ label: string; detail: string; href?: string }>;
    }>
  > = {
    "platform-dashboard": [
      {
        eyebrow: "Operators",
        title: "Launch the workspace",
        items: [
          {
            label: "Create sandbox project",
            detail: "Stand up the first isolated project before moving any protected traffic into production.",
            href: getDeveloperPortalPath(["projects"], hostMode),
          },
          {
            label: "Issue the first key",
            detail: "Name the server-side key clearly and track its usage by project from the start.",
            href: getDeveloperPortalPath(["api-keys"], hostMode),
          },
          {
            label: "Run the first protected lookup",
            detail: "Confirm the response, the consent scope, and the audit trace all land in the right place.",
            href: getDeveloperPortalPath(["playground"], hostMode),
          },
        ],
      },
      {
        eyebrow: "Routes",
        title: "Move directly into the right lane",
        items: [
          {
            label: "Customer portfolio",
            detail: "Inspect consent-scoped subjects, recent recoveries, and portfolio slices.",
            href: getDeveloperPortalPath(["customers"], hostMode),
          },
          {
            label: "Reports and exports",
            detail: "Queue finance, compliance, and cohort reports from the reporting lane.",
            href: getDeveloperPortalPath(["reports"], hostMode),
          },
          {
            label: "Billing and usage",
            detail: "Review invoice pressure, threshold alerts, and project concentration before month-end.",
            href: getDeveloperPortalPath(["billing-usage"], hostMode),
          },
          {
            label: "Organization HRS analytics",
            detail: "Inspect org-level reliability, continuity pressure, and recovery movement from the operator view.",
            href: getDeveloperPortalPath(["organization-hrs"], hostMode),
          },
          {
            label: "Organization alerts",
            detail: "Move straight into approval, continuity, payroll, and org-market alert groupings.",
            href: getDeveloperPortalPath(["organization-alerts"], hostMode),
          },
        ],
      },
    ],
    customers: [
      {
        eyebrow: "Segments",
        title: "Saved portfolio lanes",
        items: [
          {
            label: "Prime hiring cohort",
            detail: "Stable upward trend with one flagged recovery lane and no expiring identity scopes.",
          },
          {
            label: "Underwriting review queue",
            detail: "Higher-touch customer set with recent movement and two active review notes.",
          },
          {
            label: "Partner operations segment",
            detail: "Webhook-stable portfolio with low alert pressure and clean audit history.",
          },
        ],
      },
      {
        eyebrow: "Review",
        title: "What operators do next",
        items: [
          {
            label: "Open a live customer drill-down",
            detail: "Inspect one consent-scoped subject with trajectory, event timeline, and export-ready next actions.",
            href: getDeveloperPortalPath(["customers", "sovereign-node-1184"], hostMode),
          },
          {
            label: "Open reports and exports",
            detail: "Package the current slice into CSV, PDF, or a scheduled compliance bundle.",
            href: getDeveloperPortalPath(["reports"], hostMode),
          },
          {
            label: "Check access history",
            detail: "Verify who opened the record, which scope was active, and what changed recently.",
            href: getDeveloperPortalPath(["audit-logs"], hostMode),
          },
          {
            label: "Return to dashboard",
            detail: "Jump back to workspace health, alerts, and the broader operating view.",
            href: getDeveloperPortalPath(["platform-dashboard"], hostMode),
          },
        ],
      },
    ],
    "customers/sovereign-node-1184": [
      {
        eyebrow: "Trajectory",
        title: "What this page explains",
        items: [
          {
            label: "Review rises, plateaus, and recoveries",
            detail: "The detail lane should explain how the current score formed instead of leaving the operator with one flat number.",
          },
          {
            label: "Inspect consent and scope history",
            detail: "Keep identity-backed visibility, scope timing, and audit state visible from the same customer page.",
          },
          {
            label: "Export a bounded package",
            detail: "Move straight into a scope-safe export or report without losing the customer context.",
            href: getDeveloperPortalPath(["reports", "compliance-audit-package"], hostMode),
          },
        ],
      },
      {
        eyebrow: "Routing",
        title: "Work from the subject page",
        items: [
          {
            label: "Return to customer portfolio",
            detail: "Jump back to the wider cohort once the single-subject review is finished.",
            href: getDeveloperPortalPath(["customers"], hostMode),
          },
          {
            label: "Open audit history",
            detail: "Confirm who viewed the record and which consent scope was active when they did.",
            href: getDeveloperPortalPath(["audit-logs"], hostMode),
          },
          {
            label: "Review billing concentration",
            detail: "If this subject is part of a heavy workflow, jump into the project spend lane immediately.",
            href: getDeveloperPortalPath(["billing-usage", "production-underwriting"], hostMode),
          },
        ],
      },
    ],
    reports: [
      {
        eyebrow: "Queue",
        title: "Active report lanes",
        items: [
          {
            label: "Weekly portfolio summary",
            detail: "Delivers to risk and finance every Monday at 8:00 AM Eastern.",
          },
          {
            label: "Monthly usage export",
            detail: "Bundles billing detail, consent-scope coverage, and export history before invoicing.",
          },
          {
            label: "Compliance audit package",
            detail: "Prepares a bounded export with subject scope, access history, and approval context.",
          },
        ],
      },
      {
        eyebrow: "Actions",
        title: "Keep reports operational",
        items: [
          {
            label: "Open a live audit package",
            detail: "Inspect one report workflow with delivery, correction, and cost context from the same screen.",
            href: getDeveloperPortalPath(["reports", "compliance-audit-package"], hostMode),
          },
          {
            label: "Review billing impact",
            detail: "Track which report-heavy workflows are driving spend before they become surprises.",
            href: getDeveloperPortalPath(["billing-usage"], hostMode),
          },
          {
            label: "Verify webhook delivery",
            detail: "Check delivery health for scheduled export notifications and workflow callbacks.",
            href: getDeveloperPortalPath(["webhooks"], hostMode),
          },
          {
            label: "Inspect audit history",
            detail: "Confirm who generated a package and which scope made the data visible.",
            href: getDeveloperPortalPath(["audit-logs"], hostMode),
          },
        ],
      },
    ],
    "reports/compliance-audit-package": [
      {
        eyebrow: "Workflow",
        title: "Keep the package trustworthy",
        items: [
          {
            label: "Review delivery state",
            detail: "Watch preparing, delivered, retrying, or correction-required status without leaving the report page.",
          },
          {
            label: "Open billing context",
            detail: "Heavy exports should always stay tied to their billable shape and project concentration.",
            href: getDeveloperPortalPath(["billing-usage", "production-underwriting"], hostMode),
          },
          {
            label: "Inspect audit trail",
            detail: "Confirm who generated the package and which scope made the contents visible.",
            href: getDeveloperPortalPath(["audit-logs"], hostMode),
          },
        ],
      },
    ],
    "billing-usage": [
      {
        eyebrow: "Spend",
        title: "Current usage concentration",
        items: [
          {
            label: "Production underwriting",
            detail: "Largest cost lane this period, driven by consent-backed lookups and expanded history review.",
          },
          {
            label: "Sandbox workforce review",
            detail: "Healthy test traffic with low spend and clean key hygiene.",
          },
          {
            label: "Exports and report jobs",
            detail: "Second-largest billing lane, mainly finance and compliance packages.",
          },
        ],
      },
      {
        eyebrow: "Controls",
        title: "Keep the bill predictable",
        items: [
          {
            label: "Open projects",
            detail: "Split heavy workflows by project so usage spikes are easy to trace back.",
            href: getDeveloperPortalPath(["projects"], hostMode),
          },
          {
            label: "Rotate and label keys",
            detail: "Keep per-key usage understandable before the invoice closes.",
            href: getDeveloperPortalPath(["api-keys"], hostMode),
          },
          {
            label: "Review production path",
            detail: "Use the launch review lane when a workflow is ready to leave sandbox and scale up.",
            href: getDeveloperPortalPath(["production-review"], hostMode),
          },
        ],
      },
    ],
    "billing-usage/production-underwriting": [
      {
        eyebrow: "Project spend",
        title: "What this lane controls",
        items: [
          {
            label: "Trace the heaviest workflow",
            detail: "Find whether protected lookups, exports, or dashboard usage are driving the project bill.",
          },
          {
            label: "Rotate or replace the serving key",
            detail: "If one key is carrying too much load, move straight into the key lane and clean it up.",
            href: getDeveloperPortalPath(["api-keys"], hostMode),
          },
          {
            label: "Adjust report cadence",
            detail: "If export volume is the culprit, reopen the report workflow and tune the schedule instead of waiting for month-end.",
            href: getDeveloperPortalPath(["reports", "compliance-audit-package"], hostMode),
          },
        ],
      },
    ],
    "workforce-rollout": [
      {
        eyebrow: "Rollout",
        title: "Launch the workforce path cleanly",
        items: [
          {
            label: "Open invite operations",
            detail: "Move into the company-email invite lane before the approval queue starts filling with new employee requests.",
            href: getDeveloperPortalPath(["employee-invites"], hostMode),
          },
          {
            label: "Open a live rollout plan",
            detail: "Inspect one company launch with invite size, pending approvals, and the next checkpoint already attached.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Review the employee queue",
            detail: "Move straight into company-email approvals, restrictions, and restoration deadlines.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Check payroll-linked wallet rollout",
            detail: "Keep direct-deposit adoption and wallet setup tied to the same launch instead of treating them as separate programs.",
            href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
          },
        ],
      },
    ],
    "workforce-rollout/northstar-launch-q2": [
      {
        eyebrow: "Links",
        title: "Keep the rollout connected",
        items: [
          {
            label: "Open the invite batch",
            detail: "Jump directly into the company-email batch tied to this launch wave.",
            href: getDeveloperPortalPath(["employee-invites", "northstar-wave-3"], hostMode),
          },
          {
            label: "Open the approval wave",
            detail: "Jump directly into the employee queue window attached to this launch.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Open payroll rollout detail",
            detail: "Move into the direct-deposit program that supports the same employee cohort.",
            href: getDeveloperPortalPath(["payroll-and-wallet", "northstar-direct-deposit-rollout"], hostMode),
          },
          {
            label: "Return to platform dashboard",
            detail: "See rollout health beside customer, billing, and report pressure from one operating view.",
            href: getDeveloperPortalPath(["platform-dashboard"], hostMode),
          },
        ],
      },
    ],
    "employee-access-queue": [
      {
        eyebrow: "Queue",
        title: "Operate the approval wave",
        items: [
          {
            label: "Open one queue window",
            detail: "Inspect pending volume, restoration deadlines, and organization trust pressure in one focused lane.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Return to rollout planning",
            detail: "Keep queue work attached to the launch that created it instead of losing context.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Check payroll adoption",
            detail: "If queue pressure is easing, move straight into the wallet and direct-deposit rollout lane.",
            href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
          },
        ],
      },
    ],
    "employee-access-queue/northstar-q1-access-window": [
      {
        eyebrow: "Recovery",
        title: "Resolve the queue safely",
        items: [
          {
            label: "Review restricted employees with active commitments",
            detail: "Keep restoration deadlines visible before any proof window is missed.",
          },
          {
            label: "Return to rollout detail",
            detail: "The queue should stay tied to the launch plan that owns it.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Open payroll detail",
            detail: "Confirm whether wallet setup or direct-deposit readiness is contributing to queue friction.",
            href: getDeveloperPortalPath(["payroll-and-wallet", "northstar-direct-deposit-rollout"], hostMode),
          },
        ],
      },
    ],
    "employee-invites": [
      {
        eyebrow: "Invites",
        title: "Move from roster to batch delivery",
        items: [
          {
            label: "Open one invite batch",
            detail: "Inspect delivery, opens, and acceptance coverage for a live employee wave.",
            href: getDeveloperPortalPath(["employee-invites", "northstar-wave-3"], hostMode),
          },
          {
            label: "Review approval queue",
            detail: "Once invites land, move straight into the pending company-email queue.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Open organization onboarding",
            detail: "Confirm the managed first-run path employees will see after approval.",
            href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
          },
        ],
      },
    ],
    "employee-invites/northstar-wave-3": [
      {
        eyebrow: "Invite batch",
        title: "Correct and continue",
        items: [
          {
            label: "Review bounced addresses",
            detail: "Fix delivery gaps before approval operators start working from stale or incomplete roster data.",
          },
          {
            label: "Open the rollout plan",
            detail: "Return to the launch detail that owns this invite wave.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Open the approval queue",
            detail: "Once delivery is clean, move into the approval lane without losing the batch context.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
        ],
      },
    ],
    "company-email-access": [
      {
        eyebrow: "States",
        title: "Operate the company-email state model",
        items: [
          {
            label: "Open pending employer approval",
            detail: "Review the employee-facing waiting state connected to the approval queue.",
            href: getDeveloperPortalPath(["company-email-access", "pending-employer-approval"], hostMode),
          },
          {
            label: "Open blocked company-email state",
            detail: "Inspect the respectful blocked path and the admin-facing policy trace it depends on.",
            href: getDeveloperPortalPath(["company-email-access", "blocked-company-email"], hostMode),
          },
          {
            label: "Return to the queue",
            detail: "Keep pending, continuity, and blocked states attached to the live review lane.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
        ],
      },
    ],
    "company-email-access/pending-employer-approval": [
      {
        eyebrow: "Pending",
        title: "Keep the waiting state explainable",
        items: [
          {
            label: "Return to company-email states",
            detail: "Step back into the full state model once the waiting-state review is complete.",
            href: getDeveloperPortalPath(["company-email-access"], hostMode),
          },
          {
            label: "Open the approval queue",
            detail: "Review the exact organization queue that can clear this employee state.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Open managed onboarding",
            detail: "Confirm the onboarding flow the employee will enter after approval clears.",
            href: getDeveloperPortalPath(["organization-onboarding", "northstar-managed-account"], hostMode),
          },
        ],
      },
    ],
    "company-email-access/blocked-company-email": [
      {
        eyebrow: "Blocked",
        title: "Handle policy-bound denials cleanly",
        items: [
          {
            label: "Return to company-email states",
            detail: "See the broader pending, continuity, and blocked model again after this case review.",
            href: getDeveloperPortalPath(["company-email-access"], hostMode),
          },
          {
            label: "Open the queue detail",
            detail: "If the block interacts with active commitments or approvals, move back into the live queue window.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Open employee roster",
            detail: "Check whether the blocked address maps to an already-managed employee record.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
        ],
      },
    ],
    "organization-onboarding": [
      {
        eyebrow: "Onboarding",
        title: "Design the first managed employee run",
        items: [
          {
            label: "Open a managed-account template",
            detail: "Inspect one concrete onboarding path with role disclosure, visibility policy, and workspace routing attached.",
            href: getDeveloperPortalPath(["organization-onboarding", "northstar-managed-account"], hostMode),
          },
          {
            label: "Open company-email states",
            detail: "Keep pending and blocked employee paths tied to the onboarding system that follows approval.",
            href: getDeveloperPortalPath(["company-email-access"], hostMode),
          },
          {
            label: "Open the rollout plan",
            detail: "Return to the workforce launch that owns this onboarding template.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
        ],
      },
    ],
    "organization-onboarding/northstar-managed-account": [
      {
        eyebrow: "Managed onboarding",
        title: "Route the employee into the right workspace",
        items: [
          {
            label: "Return to onboarding overview",
            detail: "Step back into the broader managed onboarding system once this template review is done.",
            href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
          },
          {
            label: "Open employee directory",
            detail: "Move from the onboarding template into the active managed roster it feeds.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
          {
            label: "Open company-email pending state",
            detail: "Compare the approved onboarding flow with the employee-side waiting state that precedes it.",
            href: getDeveloperPortalPath(["company-email-access", "pending-employer-approval"], hostMode),
          },
        ],
      },
    ],
    "managed-visibility": [
      {
        eyebrow: "Visibility",
        title: "Keep the disclosure model explicit",
        items: [
          {
            label: "Open a live visibility template",
            detail: "Inspect one concrete policy object with scope, disclosure timing, and active employee coverage.",
            href: getDeveloperPortalPath(["managed-visibility", "northstar-full-managed-visibility"], hostMode),
          },
          {
            label: "Open organization onboarding",
            detail: "Visibility policy only matters if it is tied directly to the employee onboarding flow that discloses it.",
            href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
          },
          {
            label: "Open employee directory",
            detail: "Move from the policy template into the managed roster it actually governs.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
        ],
      },
    ],
    "managed-visibility/northstar-full-managed-visibility": [
      {
        eyebrow: "Visibility detail",
        title: "Compare policy, disclosure, and coverage",
        items: [
          {
            label: "Return to managed visibility",
            detail: "Step back to the visibility policy index once this template review is complete.",
            href: getDeveloperPortalPath(["managed-visibility"], hostMode),
          },
          {
            label: "Open onboarding detail",
            detail: "Confirm the employee-facing onboarding path that discloses this template.",
            href: getDeveloperPortalPath(["organization-onboarding", "northstar-managed-account"], hostMode),
          },
          {
            label: "Open employee roster",
            detail: "Review the current managed cohort governed by this visibility template.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
        ],
      },
    ],
    "continuity-access": [
      {
        eyebrow: "Continuity",
        title: "Protect active commitments during restriction",
        items: [
          {
            label: "Open one restriction window",
            detail: "Inspect a specific continuity case with deadlines, proof risk, and restore ownership attached.",
            href: getDeveloperPortalPath(["continuity-access", "jordan-lee-restriction-window"], hostMode),
          },
          {
            label: "Open approval queue",
            detail: "Continuity protection should stay tied to the live queue that created the restriction.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Open employee detail",
            detail: "Move from the continuity cohort into the specific employee record when intervention is needed.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
        ],
      },
    ],
    "continuity-access/jordan-lee-restriction-window": [
      {
        eyebrow: "Restore",
        title: "Resolve the restriction without stranding the employee",
        items: [
          {
            label: "Return to continuity overview",
            detail: "Step back to the full protected cohort once this case review is complete.",
            href: getDeveloperPortalPath(["continuity-access"], hostMode),
          },
          {
            label: "Open employee detail",
            detail: "Compare the restriction window against the employee’s full role, commitment, and payroll posture.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
          {
            label: "Open queue detail",
            detail: "If the restore deadline is slipping, move back into the queue window that owns the restriction.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
        ],
      },
    ],
    employees: [
      {
        eyebrow: "Directory",
        title: "Operate from the employee roster",
        items: [
          {
            label: "Open a live employee detail",
            detail: "Inspect one company-managed employee with commitments, HRS trajectory, and payroll setup already attached.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
          {
            label: "Review the approval queue",
            detail: "Move from the roster into pending approvals and continuity-risk restrictions without losing context.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Open managed onboarding",
            detail: "Review the organization-specific first-run path connected to this employee base.",
            href: getDeveloperPortalPath(["organization-onboarding"], hostMode),
          },
          {
            label: "Open payroll rollout",
            detail: "Keep employee operations tied to direct-deposit and wallet setup instead of splitting them into finance-only lanes.",
            href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
          },
        ],
      },
    ],
    "employees/jordan-lee": [
      {
        eyebrow: "Employee",
        title: "Work directly from the person record",
        items: [
          {
            label: "Return to the employee directory",
            detail: "Jump back to the searchable roster once the single-employee review is complete.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
          {
            label: "Open the queue window",
            detail: "If access or continuity becomes an issue, move straight into the active approval lane.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Open managed onboarding detail",
            detail: "Compare this employee record with the onboarding template that originally provisioned the role and visibility policy.",
            href: getDeveloperPortalPath(["organization-onboarding", "northstar-managed-account"], hostMode),
          },
          {
            label: "Open payroll rollout detail",
            detail: "Keep direct-deposit enrollment and wallet setup tied to the same employee context.",
            href: getDeveloperPortalPath(["payroll-and-wallet", "northstar-direct-deposit-rollout"], hostMode),
          },
        ],
      },
    ],
    "payroll-and-wallet": [
      {
        eyebrow: "Payroll",
        title: "Keep payroll rollout tied to wallet policy",
        items: [
          {
            label: "Open direct-deposit rollout",
            detail: "Inspect adoption, payout-rail coverage, and wallet setup from one operator detail surface.",
            href: getDeveloperPortalPath(["payroll-and-wallet", "northstar-direct-deposit-rollout"], hostMode),
          },
          {
            label: "Return to workforce rollout",
            detail: "Keep payroll adoption connected to the employee launch it supports.",
            href: getDeveloperPortalPath(["workforce-rollout"], hostMode),
          },
          {
            label: "Review wallet policy and recovery boundary",
            detail: "The employee wallet remains separate from basic account login and support cannot recover the Continuity Key.",
            href: "/docs/wallet-funding-and-payouts",
          },
        ],
      },
    ],
    "payroll-and-wallet/northstar-direct-deposit-rollout": [
      {
        eyebrow: "Finance",
        title: "Run the program with clean boundaries",
        items: [
          {
            label: "Review employee opt-in and payout-rail coverage",
            detail: "Program health is easiest to explain when adoption and payout readiness stay in the same lane.",
          },
          {
            label: "Open the related workforce launch",
            detail: "Jump back to the rollout plan that owns this payroll program.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Open the approval queue",
            detail: "If wallet setup is blocked by access status, go straight to the pending queue window.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
        ],
      },
    ],
    "organization-workspace": [
      {
        eyebrow: "Workspace",
        title: "Run the company workspace",
        items: [
          {
            label: "Open a live workspace detail",
            detail: "Inspect one active organization workspace with employee operations, manager lanes, and billing posture already attached.",
            href: getDeveloperPortalPath(["organization-workspace", "northstar-central-ops"], hostMode),
          },
          {
            label: "Open employee directory",
            detail: "Move from the workspace shell into the people lane that drives approvals, continuity pressure, and org-market participation.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
          {
            label: "Open manager views",
            detail: "Jump into manager-scoped team lanes without leaving the organization operating context.",
            href: getDeveloperPortalPath(["manager-views"], hostMode),
          },
          {
            label: "Open organization program economics",
            detail: "Review the separate employer-facing fee and revenue-share layer tied to organization programs.",
            href: getDeveloperPortalPath(["organization-fees"], hostMode),
          },
        ],
      },
    ],
    "organization-workspace/northstar-central-ops": [
      {
        eyebrow: "Workspace detail",
        title: "Operate from one central control room",
        items: [
          {
            label: "Return to organization workspace overview",
            detail: "Step back into the broader workspace model once this operating detail review is finished.",
            href: getDeveloperPortalPath(["organization-workspace"], hostMode),
          },
          {
            label: "Open manager team lanes",
            detail: "Move directly into team-level operating views for managers and department owners.",
            href: getDeveloperPortalPath(["manager-views", "warehouse-operations"], hostMode),
          },
          {
            label: "Open operations digest",
            detail: "Review the organization-wide daily report that summarizes employee, market, billing, and continuity movement.",
            href: getDeveloperPortalPath(["reports", "operations-digest"], hostMode),
          },
          {
            label: "Open employee detail",
            detail: "Drill into one managed employee from the same workspace context.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
        ],
      },
    ],
    "manager-views": [
      {
        eyebrow: "Managers",
        title: "Run team lanes without losing workspace context",
        items: [
          {
            label: "Open a live manager view",
            detail: "Inspect one manager-scoped team lane with approvals, deadlines, and team reliability already attached.",
            href: getDeveloperPortalPath(["manager-views", "warehouse-operations"], hostMode),
          },
          {
            label: "Open employee roster",
            detail: "Jump from the team lane into the full employee directory when cross-team review is needed.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
          {
            label: "Open continuity access",
            detail: "Manager-owned interventions should stay tied to continuity protection and active commitment deadlines.",
            href: getDeveloperPortalPath(["continuity-access"], hostMode),
          },
        ],
      },
    ],
    "manager-views/warehouse-operations": [
      {
        eyebrow: "Team detail",
        title: "Manage one active team lane",
        items: [
          {
            label: "Return to manager views",
            detail: "Step back into the broader team-lane model once this specific operating review is complete.",
            href: getDeveloperPortalPath(["manager-views"], hostMode),
          },
          {
            label: "Open workforce rollout",
            detail: "Keep the team lane tied to the broader employee launch that is still driving access pressure.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Open employee queue",
            detail: "If approvals or restores are slipping, move directly into the live access queue.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Open employee detail",
            detail: "Drill into a specific managed employee from the team lane when intervention is needed.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
        ],
      },
    ],
    "organization-fees": [
      {
        eyebrow: "Economics",
        title: "Review the separate organization fee layer",
        items: [
          {
            label: "Open a live program fee detail",
            detail: "Inspect one organization-program fee lane with employer billing and revenue-share posture already attached.",
            href: getDeveloperPortalPath(["organization-fees", "northstar-program-share"], hostMode),
          },
          {
            label: "Open billing and usage",
            detail: "Keep program economics tied to the broader invoice and usage lane instead of isolating them in a finance-only page.",
            href: getDeveloperPortalPath(["billing-usage"], hostMode),
          },
          {
            label: "Open reports and exports",
            detail: "Move directly into statements and audit-ready packages once the economics lane is clear.",
            href: getDeveloperPortalPath(["reports"], hostMode),
          },
        ],
      },
    ],
    "organization-fees/northstar-program-share": [
      {
        eyebrow: "Program economics",
        title: "Keep the org fee lane transparent",
        items: [
          {
            label: "Return to organization fees",
            detail: "Step back into the broader employer-fee model once this specific program review is complete.",
            href: getDeveloperPortalPath(["organization-fees"], hostMode),
          },
          {
            label: "Open billing project detail",
            detail: "Compare the employer-facing fee lane with the live usage and invoice concentration it sits beside.",
            href: getDeveloperPortalPath(["billing-usage", "production-underwriting"], hostMode),
          },
          {
            label: "Open operations digest",
            detail: "Tie program economics back to the org-wide operating report that explains participation and outcome movement.",
            href: getDeveloperPortalPath(["reports", "operations-digest"], hostMode),
          },
        ],
      },
    ],
    "roles-permissions/manager-control-pack": [
      {
        eyebrow: "Permissions",
        title: "Audit the exact control pack before assignment",
        items: [
          {
            label: "Return to roles and permissions",
            detail: "Step back into the broader role-template lane once this pack review is finished.",
            href: getDeveloperPortalPath(["roles-permissions"], hostMode),
          },
          {
            label: "Open employee queue",
            detail: "Confirm the managers using this pack can safely work the approval and restore queue they are meant to own.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
          {
            label: "Open manager views",
            detail: "See how this pack maps into the real team-lane surface managers operate from each day.",
            href: getDeveloperPortalPath(["manager-views", "warehouse-operations"], hostMode),
          },
        ],
      },
    ],
    "reports/operations-digest": [
      {
        eyebrow: "Digest",
        title: "Use one report to run the day",
        items: [
          {
            label: "Return to reports and exports",
            detail: "Step back into the broader report queue once the organization digest has been reviewed.",
            href: getDeveloperPortalPath(["reports"], hostMode),
          },
          {
            label: "Open organization workspace",
            detail: "Move from the daily digest into the live organization workspace it summarizes.",
            href: getDeveloperPortalPath(["organization-workspace", "northstar-central-ops"], hostMode),
          },
          {
            label: "Open manager views",
            detail: "Follow team-level issues straight into manager-owned team views.",
            href: getDeveloperPortalPath(["manager-views", "warehouse-operations"], hostMode),
          },
          {
            label: "Open employee access queue",
            detail: "Jump directly into the queue if the digest flags pending approvals or continuity pressure.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
        ],
      },
    ],
    "reports/billing-reconciliation": [
      {
        eyebrow: "Reconciliation",
        title: "Close the billing picture without losing operator context",
        items: [
          {
            label: "Return to reports and exports",
            detail: "Step back into the broader report queue once the reconciliation window is clear.",
            href: getDeveloperPortalPath(["reports"], hostMode),
          },
          {
            label: "Open billing and usage",
            detail: "Compare reconciliation variance against the live invoice and workflow concentration lane.",
            href: getDeveloperPortalPath(["billing-usage", "production-underwriting"], hostMode),
          },
          {
            label: "Open program economics",
            detail: "If employer-side fee statements are driving the mismatch, move directly into the organization program share lane.",
            href: getDeveloperPortalPath(["organization-fees", "northstar-program-share"], hostMode),
          },
        ],
      },
    ],
    "organization-alerts/continuity-pressure": [
      {
        eyebrow: "Alerting",
        title: "Work the continuity alert without breaking active commitments",
        items: [
          {
            label: "Return to organization alerts",
            detail: "Step back into the broader alert feed once this continuity case cluster is stable again.",
            href: getDeveloperPortalPath(["organization-alerts"], hostMode),
          },
          {
            label: "Open continuity access",
            detail: "Move straight into the protected employee cohort driving this alert family.",
            href: getDeveloperPortalPath(["continuity-access", "jordan-lee-restriction-window"], hostMode),
          },
          {
            label: "Open employee queue",
            detail: "If restores are lagging, move directly into the approval window that still owns the affected employees.",
            href: getDeveloperPortalPath(["employee-access-queue", "northstar-q1-access-window"], hostMode),
          },
        ],
      },
    ],
    "audit-logs/organization-access-review": [
      {
        eyebrow: "Audit",
        title: "Review access decisions with full operator context",
        items: [
          {
            label: "Return to audit logs",
            detail: "Step back into the wider audit lane after this organization access review is complete.",
            href: getDeveloperPortalPath(["audit-logs"], hostMode),
          },
          {
            label: "Open managed visibility",
            detail: "Compare access decisions against the live visibility policy template they were meant to honor.",
            href: getDeveloperPortalPath(["managed-visibility", "northstar-full-managed-visibility"], hostMode),
          },
          {
            label: "Open employee detail",
            detail: "Move from the audit trail into the affected employee record when the review needs person-level context.",
            href: getDeveloperPortalPath(["employees", "jordan-lee"], hostMode),
          },
        ],
      },
    ],
    organizations: [
      {
        eyebrow: "Setup",
        title: "Stand up the first workspace cleanly",
        items: [
          {
            label: "Name the organization",
            detail: "Define the company workspace before creating projects, keys, or workforce rollout lanes.",
          },
          {
            label: "Assign technical, billing, and audit owners",
            detail: "Keep who can ship, who can spend, and who can review clearly separated from the first day.",
          },
          {
            label: "Move into the first sandbox project",
            detail: "Once the org exists, the next clean step is to isolate the first integration inside a sandbox project.",
            href: getDeveloperPortalPath(["projects"], hostMode),
          },
          {
            label: "Open a live organization workspace",
            detail: "Inspect one organization with owners, project posture, and rollout state already attached.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
        ],
      },
    ],
    "organizations/northstar-logistics": [
      {
        eyebrow: "Workspace",
        title: "Run the organization from one lane",
        items: [
          {
            label: "Open the sandbox project",
            detail: "Jump directly into the project that currently carries the first workforce integration workload.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
          {
            label: "Open workforce rollout",
            detail: "Keep the organization page tied to the employee launch plan it is actively running.",
            href: getDeveloperPortalPath(["workforce-rollout", "northstar-launch-q2"], hostMode),
          },
          {
            label: "Open payroll rollout",
            detail: "Move into the linked direct-deposit program without leaving the workspace context.",
            href: getDeveloperPortalPath(["payroll-and-wallet", "northstar-direct-deposit-rollout"], hostMode),
          },
        ],
      },
    ],
    projects: [
      {
        eyebrow: "Projects",
        title: "Build a clean first integration path",
        items: [
          {
            label: "Create one sandbox project first",
            detail: "Avoid mixing protected production traffic into the first integration while ownership and usage are still being proven.",
          },
          {
            label: "Attach the first webhook target",
            detail: "Tie project setup to the exact endpoint and workflow it is meant to power.",
            href: getDeveloperPortalPath(["webhooks"], hostMode),
          },
          {
            label: "Issue the first server-side key",
            detail: "Once the project is named and scoped, move straight into key issuance instead of leaving setup half finished.",
            href: getDeveloperPortalPath(["api-keys"], hostMode),
          },
          {
            label: "Open a live project detail",
            detail: "Inspect one sandbox project with environment, webhook, and promotion state already attached.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
        ],
      },
    ],
    "projects/sandbox-workforce-review": [
      {
        eyebrow: "Project",
        title: "Keep the project operational",
        items: [
          {
            label: "Open the serving key",
            detail: "Move directly into the named key powering this sandbox lane.",
            href: getDeveloperPortalPath(["api-keys", "hrs-sandbox-backend"], hostMode),
          },
          {
            label: "Run a protected lookup",
            detail: "Verify the response and audit trace from the playground without leaving the project path.",
            href: getDeveloperPortalPath(["playground"], hostMode),
          },
          {
            label: "Return to organization detail",
            detail: "Keep project work tied to the workspace that owns it.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
        ],
      },
    ],
    "api-keys": [
      {
        eyebrow: "Keys",
        title: "Make key issuance operational",
        items: [
          {
            label: "Name the key for one workload",
            detail: "The first key should read like a real workload name, not a generic environment label.",
          },
          {
            label: "Store it server-side only",
            detail: "Browser bundles, native apps, and support flows should never receive the raw secret.",
          },
          {
            label: "Run the first protected lookup",
            detail: "Verify the response and audit trace immediately after issuance from the playground lane.",
            href: getDeveloperPortalPath(["playground"], hostMode),
          },
          {
            label: "Open a live key detail",
            detail: "Inspect one named key with last use, scope, and rotation health already attached.",
            href: getDeveloperPortalPath(["api-keys", "hrs-sandbox-backend"], hostMode),
          },
        ],
      },
    ],
    "api-keys/hrs-sandbox-backend": [
      {
        eyebrow: "Key",
        title: "Keep the secret explainable",
        items: [
          {
            label: "Return to project detail",
            detail: "Stay tied to the project that owns the key instead of treating the secret as a floating credential.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
          {
            label: "Run a smoke test",
            detail: "Confirm the key still returns the expected response shape from the playground lane.",
            href: getDeveloperPortalPath(["playground"], hostMode),
          },
          {
            label: "Open organization detail",
            detail: "Jump back to the workspace owner map and project posture when a rotation decision is needed.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
        ],
      },
    ],
    "account-access": [
      {
        eyebrow: "Access",
        title: "Start the workspace correctly",
        items: [
          {
            label: "Open the first workspace run",
            detail: "Move into the guided first-run lane that attaches the account to a real organization and next steps.",
            href: getDeveloperPortalPath(["account-access", "first-workspace-run"], hostMode),
          },
          {
            label: "Create the first organization",
            detail: "Once account access is stable, move directly into the organization workspace.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
          {
            label: "Open quickstarts",
            detail: "Jump to the first protected lookup path once workspace ownership is clear.",
            href: getDeveloperPortalPath(["quickstarts"], hostMode),
          },
        ],
      },
    ],
    "account-access/first-workspace-run": [
      {
        eyebrow: "First hour",
        title: "Keep the setup path moving",
        items: [
          {
            label: "Open organization detail",
            detail: "Move directly into the workspace the account is now attached to.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
          {
            label: "Create the first project",
            detail: "Once the workspace is attached, the clean next move is a sandbox project.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
          {
            label: "Open the first quickstart",
            detail: "The first-run lane should connect directly into the first protected lookup guide.",
            href: getDeveloperPortalPath(["quickstarts", "first-protected-lookup"], hostMode),
          },
        ],
      },
    ],
    "quickstarts": [
      {
        eyebrow: "Quickstarts",
        title: "Move from docs into action",
        items: [
          {
            label: "Open the first protected lookup guide",
            detail: "Follow the exact project → key → lookup → webhook sequence from one page.",
            href: getDeveloperPortalPath(["quickstarts", "first-protected-lookup"], hostMode),
          },
          {
            label: "Open sandbox access",
            detail: "If the team still needs approval, move straight into the sandbox request lane.",
            href: getDeveloperPortalPath(["sandbox-access", "workforce-vetting"], hostMode),
          },
          {
            label: "Open production review",
            detail: "Once the first lookup is stable, move directly into the live review lane.",
            href: getDeveloperPortalPath(["production-review", "northstar-live-review"], hostMode),
          },
        ],
      },
    ],
    "quickstarts/first-protected-lookup": [
      {
        eyebrow: "Lookup",
        title: "Keep the first call connected",
        items: [
          {
            label: "Open the project detail",
            detail: "Stay tied to the sandbox project that owns the lookup.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
          {
            label: "Open the serving key",
            detail: "Jump directly into the key posture that powers the first request.",
            href: getDeveloperPortalPath(["api-keys", "hrs-sandbox-backend"], hostMode),
          },
          {
            label: "Move into production review",
            detail: "Once lookup and webhook checks are stable, the next lane is the live review workflow.",
            href: getDeveloperPortalPath(["production-review", "northstar-live-review"], hostMode),
          },
        ],
      },
    ],
    "sandbox-access": [
      {
        eyebrow: "Sandbox",
        title: "Keep approvals visible",
        items: [
          {
            label: "Open a real request detail",
            detail: "Inspect the declared purpose, traffic band, and blocking checks on one request.",
            href: getDeveloperPortalPath(["sandbox-access", "workforce-vetting"], hostMode),
          },
          {
            label: "Return to quickstarts",
            detail: "Stay tied to the setup guide that will use the approval once it clears.",
            href: getDeveloperPortalPath(["quickstarts", "first-protected-lookup"], hostMode),
          },
          {
            label: "Open production review",
            detail: "See what the live review lane expects after sandbox is already proven.",
            href: getDeveloperPortalPath(["production-review"], hostMode),
          },
        ],
      },
    ],
    "sandbox-access/workforce-vetting": [
      {
        eyebrow: "Review",
        title: "Clear the request",
        items: [
          {
            label: "Open the first quickstart",
            detail: "Keep the request tied to the exact launch path it is enabling.",
            href: getDeveloperPortalPath(["quickstarts", "first-protected-lookup"], hostMode),
          },
          {
            label: "Open organization detail",
            detail: "Move back to the workspace that owns the request.",
            href: getDeveloperPortalPath(["organizations", "northstar-logistics"], hostMode),
          },
          {
            label: "Open production review",
            detail: "Check the downstream go-live lane before the request is promoted.",
            href: getDeveloperPortalPath(["production-review", "northstar-live-review"], hostMode),
          },
        ],
      },
    ],
    "production-review": [
      {
        eyebrow: "Production",
        title: "Make go-live legible",
        items: [
          {
            label: "Open a live production review",
            detail: "Inspect one release lane with real blockers and next actions already attached.",
            href: getDeveloperPortalPath(["production-review", "northstar-live-review"], hostMode),
          },
          {
            label: "Open billing and usage",
            detail: "Go-live review should stay tied to the billing lane that will carry live usage next.",
            href: getDeveloperPortalPath(["billing-usage", "production-underwriting"], hostMode),
          },
          {
            label: "Return to platform dashboard",
            detail: "Keep review work tied to the live operator console that takes over after launch.",
            href: getDeveloperPortalPath(["platform-dashboard"], hostMode),
          },
        ],
      },
    ],
    "production-review/northstar-live-review": [
      {
        eyebrow: "Release",
        title: "Clear the final blocker",
        items: [
          {
            label: "Open webhook health",
            detail: "If the last blocker is a signed-delivery check, the operator should jump straight into the webhook lane.",
            href: getDeveloperPortalPath(["webhooks"], hostMode),
          },
          {
            label: "Open the project detail",
            detail: "Keep the review tied to the project that is about to carry live protected traffic.",
            href: getDeveloperPortalPath(["projects", "sandbox-workforce-review"], hostMode),
          },
          {
            label: "Return to platform dashboard",
            detail: "Once the review clears, the dashboard becomes the primary live operating surface.",
            href: getDeveloperPortalPath(["platform-dashboard"], hostMode),
          },
        ],
      },
    ],
    playground: [
      {
        eyebrow: "Verification",
        title: "Prove the setup before production",
        items: [
          {
            label: "Validate response shape",
            detail: "Confirm HRS, consent scope, and event history come back exactly as the project expects.",
          },
          {
            label: "Confirm signed event delivery",
            detail: "Test the webhook path and the audit trace from the same lane before any live traffic begins.",
            href: getDeveloperPortalPath(["webhooks"], hostMode),
          },
          {
            label: "Request production review",
            detail: "Once the first call, key, and webhook path are clean, move directly into production review.",
            href: getDeveloperPortalPath(["production-review"], hostMode),
          },
        ],
      },
    ],
    "organization-hrs": [
      {
        eyebrow: "Trajectory",
        title: "Operate from the org score",
        items: [
          {
            label: "Open employee access queue",
            detail: "Review backlog and continuity pressure that is currently affecting the organization trend.",
            href: getDeveloperPortalPath(["employee-access-queue"], hostMode),
          },
          {
            label: "Open employee directory",
            detail: "Move from org-level trend into the people lane that is driving the current score.",
            href: getDeveloperPortalPath(["employees"], hostMode),
          },
          {
            label: "Open workforce rollout",
            detail: "Compare the trend against the current company-email launch and org-market rollout posture.",
            href: getDeveloperPortalPath(["workforce-rollout"], hostMode),
          },
        ],
      },
    ],
    "organization-alerts": [
      {
        eyebrow: "Alerts",
        title: "Resolve the highest-pressure lanes",
        items: [
          {
            label: "Review continuity deadlines",
            detail: "Open the restricted-access lane before active commitments drift into avoidable misses.",
            href: getDeveloperPortalPath(["continuity-access"], hostMode),
          },
          {
            label: "Review payroll rollout gaps",
            detail: "Move into the payroll lane when wallet funding adoption is lagging behind the employee launch.",
            href: getDeveloperPortalPath(["payroll-and-wallet"], hostMode),
          },
          {
            label: "Review managed visibility changes",
            detail: "Confirm the current org disclosure posture before another approval wave goes live.",
            href: getDeveloperPortalPath(["managed-visibility"], hostMode),
          },
        ],
      },
    ],
  };
  const activeWorkbenchPanels = pageWorkbenchPanels[currentPageKey] ?? [];
  const pageFocusPanels: Record<
    string,
    Array<{
      title: string;
      eyebrow: string;
      rows: Array<{ label: string; value: string; detail: string }>;
    }>
  > = {
    "platform-dashboard": [
      {
        eyebrow: "Workspace",
        title: "Platform command view",
        rows: [
          { label: "Live projects", value: "4 active", detail: "The dashboard should show how many protected workloads are running before the operator drills into one." },
          { label: "Report backlog", value: "3 queued", detail: "Exports and scheduled packages should stay visible from the same control surface as customer and billing pressure." },
          { label: "Next go-live gate", value: "Webhook recheck", detail: "The most immediate launch blocker should remain visible without opening a second review lane." },
        ],
      },
      {
        eyebrow: "Pressure",
        title: "Revenue and trust posture",
        rows: [
          { label: "Current invoice run-rate", value: "$4.3k MTD", detail: "Technical and finance owners should see live spend without leaving the workspace." },
          { label: "Consent expiries", value: "3 within 14 days", detail: "Expiring visibility belongs beside project and customer pressure because it changes what the workspace can actually see." },
          { label: "Workforce risk lane", value: "1 elevated queue", detail: "Employee approval pressure should stay in the same operating picture as API and report health." },
        ],
      },
    ],
    customers: [
      {
        eyebrow: "Portfolio",
        title: "Customer portfolio posture",
        rows: [
          { label: "Tracked subjects", value: "142 active", detail: "The portfolio should open with a clear count of customers the team is actively reviewing." },
          { label: "Recovering profiles", value: "18", detail: "Operators need to see how many subjects are actively climbing back, not just the flagged failures." },
          { label: "Scopes expiring soon", value: "3", detail: "Consent pressure belongs on the first portfolio screen because it changes what the team can keep monitoring." },
        ],
      },
      {
        eyebrow: "Actions",
        title: "Next operator moves",
        rows: [
          { label: "Saved segments", value: "4 active", detail: "Teams should be able to jump from the portfolio into saved cohorts without rebuilding the same filters." },
          { label: "Alerted customers", value: "7", detail: "The first screen should show where attention is actually needed, not just the total number of subjects." },
          { label: "Next package", value: "Compliance audit export", detail: "The likely next export or report should be visible from the portfolio itself." },
        ],
      },
    ],
    "customers/sovereign-node-1184": [
      {
        eyebrow: "Trajectory",
        title: "Reliability trajectory",
        rows: [
          { label: "Current trend", value: "Recovering", detail: "Recent verified completions are offsetting one earlier early-release event." },
          { label: "Plateau window", value: "19 days", detail: "The score held steady before the latest recovery cycle began." },
          { label: "Last material change", value: "Mar 5 · +14", detail: "The most recent verified completion is the event currently shaping the rise." },
        ],
      },
      {
        eyebrow: "Scope",
        title: "Consent and access",
        rows: [
          { label: "Active scope", value: "hrs.lookup.identity.extended", detail: "Identity-backed detail remains bounded by the active consent scope." },
          { label: "Consent granted", value: "Jan 14, 2026", detail: "The timestamp remains visible so operators can explain why the record is available." },
          { label: "Scope expiry", value: "Apr 1, 2026", detail: "Upcoming expiry stays visible before the enterprise loses access unexpectedly." },
        ],
      },
      {
        eyebrow: "Operator",
        title: "Next actions from the subject page",
        rows: [
          { label: "Suggested export", value: "Bounded audit package", detail: "The subject page should make the safest next export obvious instead of forcing another routing step." },
          { label: "Portfolio segment", value: "Underwriting review", detail: "The current cohort context should stay visible so the operator can explain why this subject is open." },
          { label: "Escalation owner", value: "risk.ops@northstar.example", detail: "Single-subject review needs a named owner before the record turns into a cross-team blind spot." },
        ],
      },
    ],
    reports: [
      {
        eyebrow: "Reports",
        title: "Queue and delivery posture",
        rows: [
          { label: "Queued workflows", value: "3 active", detail: "Operators should see how many reporting jobs are moving before they open one detail lane." },
          { label: "Correction windows", value: "1 open", detail: "Correction pressure belongs on the top-level reporting screen because it changes what can be relied on externally." },
          { label: "Next scheduled delivery", value: "Tomorrow · 8:00 AM", detail: "The next time-bound report should be visible without opening a second page." },
        ],
      },
      {
        eyebrow: "Exports",
        title: "Packaging and handoff",
        rows: [
          { label: "Largest package", value: "Compliance audit export", detail: "Heavy packages should stand out so teams can predict cost and delivery pressure." },
          { label: "Primary recipients", value: "Compliance + finance", detail: "The report audience should be visible alongside the workflow itself." },
          { label: "Webhook status", value: "Healthy", detail: "Delivery health should remain on the report surface instead of hiding in a separate integration lane." },
        ],
      },
    ],
    "reports/compliance-audit-package": [
      {
        eyebrow: "Workflow",
        title: "Delivery readiness",
        rows: [
          { label: "Current state", value: "Preparing", detail: "The package is building the bounded export and audit history bundle." },
          { label: "Last delivery", value: "Feb 29 · 8:00 AM", detail: "The last successful handoff is always visible on the report detail screen." },
          { label: "Correction path", value: "Open", detail: "A corrected package can still be issued without losing the audit chain." },
        ],
      },
      {
        eyebrow: "Cost",
        title: "Export impact",
        rows: [
          { label: "Billable units", value: "1 run · 12,842 rows", detail: "Heavy exports should keep their billable shape visible to both finance and operators." },
          { label: "Recipient lane", value: "Compliance mailbox", detail: "Delivery stays traceable to the exact destination and workflow owner." },
          { label: "Next operator step", value: "Audit review", detail: "The report detail page should make the next review action obvious without leaving the workflow." },
        ],
      },
      {
        eyebrow: "Corrections",
        title: "Approval and correction chain",
        rows: [
          { label: "Approval owner", value: "compliance@northstar.example", detail: "A report package needs a named owner before it becomes an official operating artifact." },
          { label: "Retry posture", value: "Signed delivery healthy", detail: "Operators should know whether the correction path is blocked by transport or by content." },
          { label: "Correction window", value: "Open until Mar 19", detail: "The report detail should make the last safe correction window explicit." },
        ],
      },
    ],
    "billing-usage": [
      {
        eyebrow: "Billing",
        title: "Invoice posture",
        rows: [
          { label: "Month-to-date spend", value: "$3.4k", detail: "The billing home should show the live invoice shape before teams open a project lane." },
          { label: "Highest-cost project", value: "production-underwriting", detail: "The largest spend driver belongs on the first billing screen." },
          { label: "Next threshold", value: "$4k alert at 82%", detail: "Threshold pressure should remain visible before finance needs to escalate." },
        ],
      },
      {
        eyebrow: "Mix",
        title: "Usage composition",
        rows: [
          { label: "Protected lookups", value: "11,284", detail: "The main unit of value should be visible from the billing surface itself." },
          { label: "Reports + exports", value: "37 jobs", detail: "Heavy packaging work should stay visible because it shifts spend and operator behavior." },
          { label: "Webhooks + dashboard", value: "182k deliveries", detail: "Delivery and operator traffic should be explicit instead of buried in one total." },
        ],
      },
    ],
    "billing-usage/production-underwriting": [
      {
        eyebrow: "Spend",
        title: "Project concentration",
        rows: [
          { label: "Total cost", value: "$2,984.42", detail: "This project is the largest cost lane in the current billing period." },
          { label: "Largest workflow", value: "Protected lookup batch", detail: "Most of the spend is tied to high-volume trust lookups rather than dashboard browsing." },
          { label: "Threshold alerts", value: "2 active", detail: "Operators still have time to adjust before the invoice closes." },
        ],
      },
      {
        eyebrow: "Mix",
        title: "Workflow mix",
        rows: [
          { label: "Protected lookups", value: "62%", detail: "The primary spend driver is still the live lookup lane." },
          { label: "Reports and exports", value: "21%", detail: "Scheduled packages are the second-largest contributor to project cost." },
          { label: "Dashboard + webhooks", value: "17%", detail: "Operator usage and delivery traffic remain visible instead of being hidden under one total." },
        ],
      },
      {
        eyebrow: "Owners",
        title: "Billing actions and controls",
        rows: [
          { label: "Finance owner", value: "finance@northstar.example", detail: "Project billing should show who owns the invoice conversation before spend drifts further." },
          { label: "Optimization move", value: "Trim export cadence", detail: "The page should surface the most obvious cost-control action tied to the current spend mix." },
          { label: "Next review", value: "Mar 14 · 11:30 AM", detail: "A billing lane should show when the next owner review is due, not just the current total." },
        ],
      },
    ],
    "workforce-rollout/northstar-launch-q2": [
      {
        eyebrow: "Launch",
        title: "Rollout readiness",
        rows: [
          { label: "Pending approvals", value: "46 employees", detail: "The launch detail should show exactly how much queue pressure is left before the wave goes live." },
          { label: "Blocked aliases", value: "3 company aliases", detail: "Email-domain and alias restrictions should be visible before the invite batch is sent." },
          { label: "Next checkpoint", value: "Mar 18 · 1:00 PM", detail: "The rollout owner needs the next checkpoint on the first screen, not hidden in a side menu." },
        ],
      },
      {
        eyebrow: "Program",
        title: "Connected rollout lanes",
        rows: [
          { label: "Invite batch", value: "northstar-wave-3", detail: "The current employee invite wave should stay visible from the rollout detail page." },
          { label: "Queue window", value: "northstar-q1-access-window", detail: "The employee-approval wave linked to this launch remains one click away." },
          { label: "Payroll program", value: "northstar-direct-deposit-rollout", detail: "Direct-deposit adoption and wallet setup are part of the same rollout, not a disconnected finance task." },
          { label: "Company onboarding", value: "northstar-launch-q2", detail: "The active onboarding template stays visible so operators know which employee experience is shipping." },
        ],
      },
    ],
    "employee-invites/northstar-wave-3": [
      {
        eyebrow: "Delivery",
        title: "Invite batch health",
        rows: [
          { label: "Sent", value: "240", detail: "The operator should see the actual wave size before chasing approvals that never received an email." },
          { label: "Opened", value: "198", detail: "Open rate helps the rollout owner understand whether employees are actually seeing the invitation." },
          { label: "Accepted", value: "162", detail: "Acceptance is what turns invite delivery into real workforce onboarding throughput." },
        ],
      },
      {
        eyebrow: "Corrections",
        title: "Fix what is blocking the next wave",
        rows: [
          { label: "Bounced", value: "5", detail: "Incorrect addresses or blocked aliases should remain visible until they are corrected or removed." },
          { label: "Role template", value: "Team member", detail: "Role mapping belongs on the batch detail surface because it drives the approval and onboarding paths that follow." },
          { label: "Next action", value: "Move accepted users into approval queue", detail: "This page should always point to the next operational lane rather than ending at delivery status." },
        ],
      },
    ],
    "company-email-access/pending-employer-approval": [
      {
        eyebrow: "Pending",
        title: "Employee waiting posture",
        rows: [
          { label: "Detected organization", value: "Northstar Logistics", detail: "The employee should know which organization recognized the company email." },
          { label: "Requested role", value: "Operations manager", detail: "The pending state should stay tied to the requested scope rather than feeling generic." },
          { label: "Realtime status", value: "Live", detail: "The page should reflect queue changes without forcing the employee into a dead refresh loop." },
        ],
      },
      {
        eyebrow: "Follow-up",
        title: "Safe next steps",
        rows: [
          { label: "Employee action", value: "Request access again", detail: "The waiting state should give the employee one clear follow-up action." },
          { label: "Queue owner", value: "manager.romero@northstar.example", detail: "The internal owner should remain visible to admins and support operators." },
          { label: "Next employee view", value: "Managed onboarding", detail: "Once approval clears, the employee should move directly into the organization onboarding flow." },
        ],
      },
    ],
    "company-email-access/blocked-company-email": [
      {
        eyebrow: "Blocked",
        title: "Respectful denial state",
        rows: [
          { label: "Employee view", value: "Access has not been granted", detail: "The employee-facing message should stay clear without exposing private policy detail." },
          { label: "Internal source", value: "Blocked alias policy", detail: "Admins still need the auditable internal reason bound to the case." },
          { label: "Restore path", value: "Manual admin restore", detail: "A blocked company-email case should still leave a clean future restore path if policy changes." },
        ],
      },
    ],
    "organization-onboarding/northstar-managed-account": [
      {
        eyebrow: "Managed start",
        title: "Employee first-run posture",
        rows: [
          { label: "Default workspace", value: "Organization workspace", detail: "The employee’s first signed-in destination should be explicit and policy-aware." },
          { label: "Role template", value: "Operations manager", detail: "The managed onboarding detail should show the exact role mapping being applied." },
          { label: "Visibility policy", value: "Full managed account visibility", detail: "Visibility scope must be disclosed up front because it shapes what the organization can review." },
        ],
      },
      {
        eyebrow: "Activation",
        title: "First active programs",
        rows: [
          { label: "Markets", value: "Dock readiness · Handoff audit · Safety checks", detail: "The employee should know which programs open first after approval." },
          { label: "Channels", value: "General · Results · Handoff audit", detail: "The first social surfaces should already be attached to the managed onboarding flow." },
          { label: "Next milestone", value: "Approve + route to workspace", detail: "Onboarding detail should always point to the exact activation outcome." },
        ],
      },
    ],
    "managed-visibility/northstar-full-managed-visibility": [
      {
        eyebrow: "Visibility",
        title: "Scope and disclosure posture",
        rows: [
          { label: "Scope", value: "Full managed account visibility", detail: "The detail page should make the exact organization review scope visible before any manager action is taken." },
          { label: "Disclosure state", value: "Confirmed", detail: "The employee-facing disclosure should be treated as part of the policy, not a separate note." },
          { label: "Manager review mode", value: "Permitted global markets", detail: "The allowed review surface should stay explicit and bounded." },
        ],
      },
      {
        eyebrow: "Coverage",
        title: "Who this template currently governs",
        rows: [
          { label: "Active employees", value: "716", detail: "The current managed cohort should stay visible so the operator understands the blast radius of any policy edit." },
          { label: "Last revision", value: "Mar 10 · 11:06 AM", detail: "Revision timing belongs on the detail surface because it affects audit and disclosure trust." },
          { label: "Default route", value: "Organization workspace", detail: "The visibility template should remain tied to the routing behavior that employees actually experience." },
        ],
      },
    ],
    "continuity-access/jordan-lee-restriction-window": [
      {
        eyebrow: "Restriction",
        title: "Continuity protection posture",
        rows: [
          { label: "Access state", value: "Continuity access", detail: "The employee retains the minimum required access because active commitments still exist." },
          { label: "Restricted at", value: "Mar 12 · 8:42 AM", detail: "Restriction timing matters because it frames the restore window and audit trail." },
          { label: "Restore owner", value: "manager.romero@northstar.example", detail: "The operator responsible for the restore should be visible from the first screen." },
        ],
      },
      {
        eyebrow: "Deadlines",
        title: "What is still at risk",
        rows: [
          { label: "Active commitments", value: "4", detail: "This employee still has four live commitments that justify continuity protection." },
          { label: "Proof windows at risk", value: "1", detail: "One proof path still depends on timely restore or continued protected access." },
          { label: "Restore required by", value: "Mar 15 · 4:00 PM", detail: "The deadline for safe restoration should stay visible and auditable." },
        ],
      },
    ],
    "employee-access-queue/northstar-q1-access-window": [
      {
        eyebrow: "Queue",
        title: "Approval pressure",
        rows: [
          { label: "Pending requests", value: "46", detail: "The detail view should show the exact batch still waiting on review." },
          { label: "Bulk-approvable", value: "29", detail: "Safe bulk approvals should remain obvious instead of buried under extra filtering." },
          { label: "Restricted with active commitments", value: "7", detail: "These are the employees whose access state could still affect active deadlines if not restored." },
        ],
      },
      {
        eyebrow: "Risk",
        title: "Restriction and trust pressure",
        rows: [
          { label: "Nearest restore deadline", value: "Mar 15 · 4:00 PM", detail: "The operator should know when access must be restored before a live proof window is at risk." },
          { label: "Organization HRS pressure", value: "Elevated", detail: "Queue health should connect back to organization trust where policy allows." },
          { label: "Review owner", value: "manager.romero@northstar.example", detail: "The responsible owner should be visible on the queue detail surface itself." },
        ],
      },
    ],
    employees: [
      {
        eyebrow: "Directory",
        title: "Employee operations posture",
        rows: [
          { label: "Searchable roster", value: "842 records", detail: "The employee lane should feel like a real directory with live people, not a static settings list." },
          { label: "Manager-owned teams", value: "12", detail: "Team ownership stays visible so managers can work from their real operating boundary." },
          { label: "Pending joins", value: "46", detail: "Approval pressure belongs on the employee page because it changes how the roster is actually shaped." },
        ],
      },
      {
        eyebrow: "Coverage",
        title: "Visibility and access posture",
        rows: [
          { label: "Continuity-access employees", value: "7", detail: "Employees with active commitments and reduced org access remain visible as a protected cohort." },
          { label: "Payroll-linked employees", value: "312", detail: "Direct-deposit and wallet setup should stay visible from the same employee operating surface." },
          { label: "Managed visibility mode", value: "Full managed account visibility", detail: "The organization’s disclosure posture should stay readable beside the roster." },
        ],
      },
    ],
    "employees/jordan-lee": [
      {
        eyebrow: "Employee",
        title: "Role and operating posture",
        rows: [
          { label: "Role", value: "Manager", detail: "This employee currently operates inside the manager role template for Warehouse Operations." },
          { label: "Manager", value: "Dana Romero", detail: "The reporting line stays visible so access or performance interventions have a clear owner." },
          { label: "Visibility policy", value: "Full managed account visibility", detail: "The organization’s current visibility scope is explicit and auditable from the employee page." },
        ],
      },
      {
        eyebrow: "Commitments",
        title: "Current commitment posture",
        rows: [
          { label: "Live commitments", value: "4", detail: "The employee still has four active commitments with one proof window opening this week." },
          { label: "Completed commitments", value: "29", detail: "Completed commitments stay visible as a reliability track record instead of a hidden ledger-only number." },
          { label: "Missed commitments", value: "2", detail: "Missed outcomes remain visible, but recoveries and recent rises are kept in context beside them." },
        ],
      },
      {
        eyebrow: "Payroll",
        title: "Funding and wallet posture",
        rows: [
          { label: "Direct deposit", value: "Enrolled", detail: "Payroll-linked funding is active for this employee under the current organization program." },
          { label: "Payout rail", value: "Debit-card enabled", detail: "The employee has a payout path configured without giving the employer wallet-sensitive access." },
          { label: "Continuity boundary", value: "Protected", detail: "Wallet-sensitive actions still require the employee’s own local wallet controls and recovery material." },
        ],
      },
    ],
    "payroll-and-wallet/northstar-direct-deposit-rollout": [
      {
        eyebrow: "Payroll",
        title: "Adoption profile",
        rows: [
          { label: "Employee opt-in", value: "38%", detail: "The payroll detail should show how far adoption has moved inside the active cohort." },
          { label: "Wallet setup complete", value: "312 employees", detail: "Wallet readiness belongs on the same screen as payroll enablement." },
          { label: "Linked payout rails", value: "208", detail: "Payout-rail readiness should stay visible before the next payroll window opens." },
        ],
      },
      {
        eyebrow: "Boundary",
        title: "Wallet recovery boundary",
        rows: [
          { label: "Wallet unlock", value: "Local password + approved biometrics", detail: "Wallet-sensitive access remains on-device even when payroll funding is enabled." },
          { label: "Recovery material", value: "12-Word Continuity Key", detail: "The Continuity Key remains the recovery boundary for new-device or lost wallet-sensitive access." },
          { label: "Support role", value: "Documentation only", detail: "Support can point to the policy but cannot recover the key or unlock the wallet for the user." },
        ],
      },
    ],
    "account-access": [
      {
        eyebrow: "Access",
        title: "Workspace access posture",
        rows: [
          { label: "Current viewer state", value: isAuthenticated ? "Signed in" : "Account required", detail: "The account-access page should make the current access state obvious before the user moves into organization setup." },
          { label: "First workspace run", value: "Guided", detail: "The first-run lane should be visible from the access page instead of hiding behind generic onboarding language." },
          { label: "Next move", value: "Attach organization", detail: "Once account access is clean, the user should know the exact next operating step." },
        ],
      },
      {
        eyebrow: "Owners",
        title: "Who this path is for",
        rows: [
          { label: "Technical owner", value: "Primary", detail: "The person shipping the integration usually owns the first account and workspace attach path." },
          { label: "Billing owner", value: "Joined next", detail: "Finance can be added once the workspace exists and billing responsibility is clear." },
          { label: "Audit owner", value: "Added after setup", detail: "Audit and compliance ownership follow the initial technical setup instead of blocking it." },
        ],
      },
    ],
    "quickstarts": [
      {
        eyebrow: "Quickstarts",
        title: "Setup path posture",
        rows: [
          { label: "Primary guide", value: "First protected lookup", detail: "The quickstarts page should make the exact first implementation path obvious." },
          { label: "Sandbox dependency", value: "Visible", detail: "Teams should see whether sandbox approval is already cleared before they burn time on setup." },
          { label: "Next move", value: "Project → key → test", detail: "The full sequence should stay legible from the top quickstart surface." },
        ],
      },
      {
        eyebrow: "Handoff",
        title: "What quickstarts should unlock",
        rows: [
          { label: "Project detail", value: "Linked", detail: "The quickstart should move directly into the real project that owns the work." },
          { label: "Key posture", value: "Named", detail: "The first key should stay tied to the quickstart rather than floating as a generic secret." },
          { label: "Production path", value: "Visible", detail: "A good quickstart should already point toward the live review lane." },
        ],
      },
    ],
    "sandbox-access": [
      {
        eyebrow: "Sandbox",
        title: "Approval queue posture",
        rows: [
          { label: "Requests open", value: "1 active", detail: "The sandbox page should show whether the team already has a live review in flight." },
          { label: "Blocking checks", value: "Visible", detail: "Missing billing or webhook declarations should be obvious before the request is opened." },
          { label: "Next move", value: "Clear review blockers", detail: "The page should tell the team exactly what gets them to approved." },
        ],
      },
      {
        eyebrow: "Launch",
        title: "What sandbox enables",
        rows: [
          { label: "First key", value: "Issued after approval", detail: "The sandbox lane exists to unlock the first safe key, not just a docs acknowledgement." },
          { label: "Example subjects", value: "Available", detail: "Testing payloads and example records should be part of the approval outcome." },
          { label: "Next handoff", value: "Playground", detail: "Once approved, the next screen should be the first protected lookup flow." },
        ],
      },
    ],
    "production-review": [
      {
        eyebrow: "Production",
        title: "Go-live queue posture",
        rows: [
          { label: "Current lane", value: "Live review", detail: "Production review should read like an active queue, not a passive policy page." },
          { label: "Critical blockers", value: "Webhook + consent", detail: "The live review page should show what still stands between the workspace and production." },
          { label: "Next move", value: "Clear final checks", detail: "The operator should know the exact remaining gate before launch." },
        ],
      },
      {
        eyebrow: "After launch",
        title: "Operating handoff",
        rows: [
          { label: "Primary console", value: "Platform dashboard", detail: "Once production clears, the operator should move into the dashboard instead of back into docs." },
          { label: "Billing lane", value: "Live usage", detail: "Production review should keep the billing and usage lane visible because it becomes active immediately after go-live." },
          { label: "Audit trail", value: "Continuous", detail: "The same release lane should point straight into audit and reporting once traffic is live." },
        ],
      },
    ],
    "organizations/northstar-logistics": [
      {
        eyebrow: "Owners",
        title: "Workspace ownership",
        rows: [
          { label: "Technical owner", value: "devops@northstar.example", detail: "The person shipping the integration should be explicit on the organization detail page." },
          { label: "Billing owner", value: "finance@northstar.example", detail: "Billing and usage review should have a named owner instead of a generic organization role." },
          { label: "Workforce owner", value: "ops@northstar.example", detail: "Employee rollout and queue pressure should stay tied to the owner who can actually act on them." },
        ],
      },
      {
        eyebrow: "Posture",
        title: "Workspace posture",
        rows: [
          { label: "Projects", value: "4 active", detail: "Organization detail should show the real scope of the workspace at a glance." },
          { label: "Live rollouts", value: "3", detail: "Workforce launches belong beside projects and reports on the same operator screen." },
          { label: "Payroll programs", value: "1 active", detail: "Direct-deposit and wallet adoption stay part of the organization's operating picture." },
        ],
      },
    ],
    "projects/sandbox-workforce-review": [
      {
        eyebrow: "Environment",
        title: "Project posture",
        rows: [
          { label: "Environment", value: "Sandbox", detail: "The detail lane should show environment before the operator reaches for any live key or webhook." },
          { label: "Webhook targets", value: "3", detail: "Endpoint count should be visible alongside usage and serving assets." },
          { label: "Threshold alerts", value: "1 active", detail: "Project health should remain visible before the project goes to production review." },
        ],
      },
      {
        eyebrow: "Promotion",
        title: "Promotion readiness",
        rows: [
          { label: "Serving keys", value: "2", detail: "Key count belongs on the project detail page so rotation and promotion remain tied together." },
          { label: "Usage pressure", value: "Low", detail: "Operators should know whether the sandbox lane is still light or nearing production-like load." },
          { label: "Promotion state", value: "Ready for review", detail: "This is the operational answer the workspace needs before moving the project forward." },
        ],
      },
    ],
    "api-keys/hrs-sandbox-backend": [
      {
        eyebrow: "Scope",
        title: "Key posture",
        rows: [
          { label: "Serving project", value: "sandbox-workforce-review", detail: "A key detail page should always point back to the project that owns it." },
          { label: "Last used", value: "Mar 12 · 2:18 PM", detail: "Last successful use stays visible without opening a separate audit screen." },
          { label: "Rotation due", value: "22 days", detail: "The operator should see when the key needs rotation from the first screen." },
        ],
      },
      {
        eyebrow: "Usage",
        title: "Workload clarity",
        rows: [
          { label: "Label", value: "hrs-sandbox-backend", detail: "Key naming should describe the real workload instead of a generic environment string." },
          { label: "Scope", value: "hrs.lookup.identity", detail: "Scope should remain visible so the operator knows exactly what this key can do." },
          { label: "State", value: "Healthy", detail: "The detail page should make stale or overlapping key windows obvious before they become an incident." },
        ],
      },
    ],
    "account-access/first-workspace-run": [
      {
        eyebrow: "Access",
        title: "Workspace attach state",
        rows: [
          { label: "Viewer role", value: "Technical owner", detail: "The first workspace run should make the operator role explicit from the moment the account attaches." },
          { label: "Attach state", value: "Complete", detail: "The user should know whether organization attachment is already done before reaching projects or keys." },
          { label: "Next sequence", value: "Project → key → lookup", detail: "The onboarding detail should keep the first-hour path visible at all times." },
        ],
      },
    ],
    "quickstarts/first-protected-lookup": [
      {
        eyebrow: "Quickstart",
        title: "Lookup completion path",
        rows: [
          { label: "Project", value: "sandbox-workforce-review", detail: "The quickstart should stay tied to the real project that owns the first request." },
          { label: "Key label", value: "hrs-sandbox-backend", detail: "The key powering the first lookup should remain visible on the same detail screen." },
          { label: "Next handoff", value: "Production review", detail: "Once the first request and webhook are stable, the detail lane should point directly into live review." },
        ],
      },
    ],
    "sandbox-access/workforce-vetting": [
      {
        eyebrow: "Sandbox",
        title: "Approval posture",
        rows: [
          { label: "Declared purpose", value: "workforce_vetting", detail: "The request purpose should stay visible throughout the sandbox approval lane." },
          { label: "Traffic band", value: "2k–5k monthly", detail: "Expected protected usage belongs on the request detail page, not hidden in intake notes." },
          { label: "Blocking checks", value: "2 remaining", detail: "The operator should know exactly what still prevents approval." },
        ],
      },
    ],
    "production-review/northstar-live-review": [
      {
        eyebrow: "Production",
        title: "Go-live posture",
        rows: [
          { label: "Review state", value: "Waiting on final webhook check", detail: "The live review page should show the real blocker instead of a vague pending state." },
          { label: "Consent review", value: "Passed", detail: "Consent handling belongs on the same detail lane as the webhook and billing checks." },
          { label: "Next action", value: "Verify last signed delivery", detail: "The exact next release action should remain visible until the lane is fully cleared." },
        ],
      },
    ],
    organizations: [
      {
        eyebrow: "Setup",
        title: "Workspace setup path",
        rows: [
          { label: "Organization created", value: "Step 1", detail: "Define the company workspace before projects, keys, or exports exist." },
          { label: "Owners assigned", value: "Technical · Billing · Audit", detail: "The first setup path should keep those roles visible and separate." },
          { label: "Next move", value: "Create sandbox project", detail: "Once the organization exists, the clean next step is to isolate the first integration." },
        ],
      },
      {
        eyebrow: "Readiness",
        title: "Organization handoff",
        rows: [
          { label: "Projects linked", value: "Visible on detail", detail: "The organization page should make project, rollout, and payroll lanes easy to reach from one workspace view." },
          { label: "Owner coverage", value: "Technical + billing + workforce", detail: "The first org screen should show whether ownership is complete enough to move forward." },
          { label: "Next lane", value: "Sandbox project", detail: "The page should point cleanly into the next setup surface instead of ending at org creation." },
        ],
      },
    ],
    projects: [
      {
        eyebrow: "Project",
        title: "First integration shape",
        rows: [
          { label: "Environment", value: "Sandbox first", detail: "Protected production traffic should not be mixed into the first integration." },
          { label: "Webhook target", value: "Required", detail: "Project setup should stay tied to the endpoint and event flow it actually powers." },
          { label: "Next move", value: "Issue server-side key", detail: "Project setup should flow directly into key issuance once the scope is clear." },
        ],
      },
      {
        eyebrow: "Promotion",
        title: "Project readiness",
        rows: [
          { label: "Current environment", value: "Sandbox", detail: "The top-level project page should keep environment posture visible before any production move is attempted." },
          { label: "Serving assets", value: "Webhook + key", detail: "The project page should clarify that keys and webhook targets belong to the project, not to the workspace in general." },
          { label: "Next lane", value: "Playground verification", detail: "Once the project exists, the next serious step is a protected lookup and webhook check." },
        ],
      },
    ],
    "api-keys": [
      {
        eyebrow: "Keys",
        title: "Key hygiene",
        rows: [
          { label: "Serving keys", value: "4 active", detail: "Each key should stay named for one project and one workload." },
          { label: "Rotation window", value: "8 days since last rotation", detail: "Rotation health belongs on the key page itself, not in a hidden admin lane." },
          { label: "Next move", value: "Run protected lookup", detail: "Immediately verify the new key from the playground after issuance." },
        ],
      },
      {
        eyebrow: "Boundaries",
        title: "Secret handling posture",
        rows: [
          { label: "Storage rule", value: "Server-side only", detail: "The key page should make it obvious that raw secrets never belong in browser or mobile bundles." },
          { label: "Naming rule", value: "Project + workload", detail: "Every key should remain traceable to one project and one job." },
          { label: "Next lane", value: "Playground smoke test", detail: "A new key should move directly into a live verification step." },
        ],
      },
    ],
    playground: [
      {
        eyebrow: "Verification",
        title: "First live test",
        rows: [
          { label: "Response shape", value: "Scope verified", detail: "The first live test should prove the subject payload and consent fields are wired correctly." },
          { label: "Webhook trace", value: "Healthy", detail: "Signed event verification belongs in the same testing lane as the response itself." },
          { label: "Promotion path", value: "Ready for review", detail: "A clean first call should move directly into production review instead of back into docs." },
        ],
      },
      {
        eyebrow: "Next actions",
        title: "What the test should unlock",
        rows: [
          { label: "Project confidence", value: "Established", detail: "The playground should prove the project, key, and response shape are all aligned." },
          { label: "Review target", value: "Production review", detail: "A clean test call should feed directly into the live approval lane." },
          { label: "Audit trail", value: "Captured", detail: "The operator should know the request and webhook trace already landed in the audit history." },
        ],
      },
    ],
    "organization-workspace": [
      {
        eyebrow: "Workspace",
        title: "Organization operating posture",
        rows: [
          { label: "Managed employees", value: "842", detail: "The workspace overview should show the size of the active organization footprint before the operator drills deeper." },
          { label: "Active programs", value: "6", detail: "Organization markets, payroll programs, and review queues should stay visible from the first workspace screen." },
          { label: "Critical queue", value: "1 continuity lane", detail: "The overview needs to show whether the workspace is under active access or deadline pressure." },
        ],
      },
      {
        eyebrow: "Owners",
        title: "Organization control coverage",
        rows: [
          { label: "Technical owner", value: "Assigned", detail: "The workspace should make ownership explicit before keys, webhooks, and program changes start moving." },
          { label: "People ops owner", value: "Assigned", detail: "Employee approval, continuity, and program rollout need a clearly named organization owner." },
          { label: "Finance owner", value: "Assigned", detail: "Billing, payroll, and employer-fee posture belong in the same operator picture." },
        ],
      },
    ],
    "organization-workspace/northstar-central-ops": [
      {
        eyebrow: "Operations",
        title: "Central workspace posture",
        rows: [
          { label: "Daily active managers", value: "14", detail: "The detail lane should show how many manager-owned team surfaces are actually running today." },
          { label: "Approvals waiting", value: "46", detail: "Pending access volume needs to stay visible because it directly shapes continuity and onboarding pressure." },
          { label: "Programs requiring attention", value: "2", detail: "The workspace should surface which org programs need intervention before issues spread across teams." },
        ],
      },
      {
        eyebrow: "Movement",
        title: "What changed most recently",
        rows: [
          { label: "Largest employee wave", value: "Warehouse ops", detail: "The current growth lane should be visible from the workspace detail before the operator opens team views." },
          { label: "Finance pressure", value: "Stable", detail: "The org-wide economics lane should remain easy to read from the same operating detail." },
          { label: "Continuity risk", value: "Contained", detail: "Current active-commitment protection is working, but still needs active monitoring." },
        ],
      },
    ],
    "manager-views": [
      {
        eyebrow: "Teams",
        title: "Manager lane mix",
        rows: [
          { label: "Manager-owned teams", value: "8", detail: "The manager overview should show how many scoped team lanes the organization is actively running." },
          { label: "Teams with queue pressure", value: "3", detail: "Approval and continuity pressure should be visible before opening one specific team lane." },
          { label: "Teams with active programs", value: "5", detail: "Program participation should stay tied to the team operating model, not hidden in a separate analytics page." },
        ],
      },
      {
        eyebrow: "Manager actions",
        title: "Common operating needs",
        rows: [
          { label: "Most urgent lane", value: "Warehouse Operations", detail: "The overview should make it obvious which manager lane needs attention first." },
          { label: "Pending restores", value: "2", detail: "Restore-access pressure belongs in the manager picture because it affects active commitments directly." },
          { label: "Upcoming org deadlines", value: "4 this week", detail: "Team-level deadlines should stay visible before the manager opens one employee record." },
        ],
      },
    ],
    "manager-views/warehouse-operations": [
      {
        eyebrow: "Team detail",
        title: "Warehouse operations posture",
        rows: [
          { label: "Team members", value: "132", detail: "The manager detail lane should show the scope of the team before any employee drill-down begins." },
          { label: "Pending approvals", value: "18", detail: "Team-level approval pressure should stay visible alongside deadlines and participation status." },
          { label: "Active commitments", value: "74", detail: "Managers need a live read on how much in-flight work this lane is carrying." },
        ],
      },
      {
        eyebrow: "Stability",
        title: "Team operating confidence",
        rows: [
          { label: "Proof window risk", value: "1 lane elevated", detail: "The team lane should show where commitment continuity could slip without intervention." },
          { label: "Participation quality", value: "Strong", detail: "Most current team market movement is healthy and does not require corrective action." },
          { label: "Manager review cadence", value: "Daily", detail: "The detail surface should show how often this team is being actively reviewed." },
        ],
      },
    ],
    "organization-fees": [
      {
        eyebrow: "Economics",
        title: "Employer-side fee posture",
        rows: [
          { label: "Active fee programs", value: "3", detail: "The page should show how many employer-facing economics programs are live before the operator drills into one." },
          { label: "Separate from Sovereign Spark", value: "Yes", detail: "The org fee lane must remain clearly distinct from the core platform-fee layer." },
          { label: "Invoice visibility", value: "Exportable", detail: "Employers need transparent statement and billing views tied to these programs." },
        ],
      },
      {
        eyebrow: "Controls",
        title: "What the economics lane governs",
        rows: [
          { label: "Program statements", value: "Monthly", detail: "The employer-facing fee layer should be visible in recurring statements and audit packages." },
          { label: "Margin guardrail", value: "Protected", detail: "Organization economics cannot erode the core platform margin or core user economics." },
          { label: "Customization path", value: "Contract-bound", detail: "Any employer fee variation should stay explicit and contract-governed." },
        ],
      },
    ],
    "organization-fees/northstar-program-share": [
      {
        eyebrow: "Program fee",
        title: "Northstar program economics",
        rows: [
          { label: "Employer fee mode", value: "Active", detail: "The program detail should show whether the employer-side fee lane is actually in force." },
          { label: "Statement cadence", value: "Monthly", detail: "Billing visibility should stay visible on the detail page instead of hiding in a finance lane." },
          { label: "Related org program", value: "Operations sprint markets", detail: "The economics lane should stay tied to the actual organization program it monetizes." },
        ],
      },
      {
        eyebrow: "Protections",
        title: "Economic boundary rules",
        rows: [
          { label: "Employee wage impact", value: "No silent reduction", detail: "The detail view should make it explicit that employer economics do not silently reduce employee wages or stakes." },
          { label: "Core fee integrity", value: "Preserved", detail: "Sovereign Spark remains intact and separately represented." },
          { label: "Auditability", value: "Enabled", detail: "Every employer-fee change must stay exportable and traceable." },
        ],
      },
    ],
    "roles-permissions/manager-control-pack": [
      {
        eyebrow: "Permissions",
        title: "Manager control template",
        rows: [
          { label: "Pack version", value: "manager-control-pack", detail: "Role templates should read like versioned operating packs, not loose permission bundles." },
          { label: "Queue authority", value: "Approve + restore", detail: "This pack controls who can clear approvals and who can preserve continuity for active commitments." },
          { label: "Visibility limit", value: "Manager-scoped", detail: "The pack remains bounded to manager lanes and does not silently grant broader organization visibility." },
        ],
      },
      {
        eyebrow: "Safeguards",
        title: "What this pack still cannot do",
        rows: [
          { label: "Wallet access", value: "No override", detail: "Managers cannot unlock wallet-sensitive actions or bypass local wallet protections." },
          { label: "Audit requirement", value: "Always on", detail: "Every assignment and change to this pack remains attached to the organization audit trail." },
          { label: "Escalation path", value: "Owner review", detail: "Higher-risk actions still route through owner or admin review instead of living entirely in the manager lane." },
        ],
      },
    ],
    "reports/operations-digest": [
      {
        eyebrow: "Digest",
        title: "Daily operating summary",
        rows: [
          { label: "Coverage", value: "Employees + markets + billing", detail: "The operations digest should make clear that it spans the full organization workspace rather than one silo." },
          { label: "Primary audience", value: "Ops + people + finance", detail: "The report should read like a cross-functional operator brief, not a narrow export." },
          { label: "Next send", value: "Tomorrow · 7:30 AM", detail: "The next delivery window belongs on the report detail page." },
        ],
      },
      {
        eyebrow: "Signals",
        title: "What the digest calls out",
        rows: [
          { label: "Approval pressure", value: "Elevated", detail: "Queue movement and pending approvals should be highlighted when they are affecting rollout quality." },
          { label: "Program performance", value: "Stable", detail: "The digest should keep market/program movement legible for managers and finance." },
          { label: "Continuity watch", value: "Active", detail: "Any access situation that could affect live commitments should be summarized in the report." },
        ],
      },
    ],
    "reports/billing-reconciliation": [
      {
        eyebrow: "Reconciliation",
        title: "Billing close posture",
        rows: [
          { label: "Current window", value: "Month-to-date", detail: "The reconciliation detail should show the exact statement window being reconciled." },
          { label: "Exceptions", value: "2 open items", detail: "Operators need mismatch count and severity immediately, not after drilling through export history." },
          { label: "Last balanced", value: "Mar 10 · 6:12 PM", detail: "The last clean close tells finance how stale the current discrepancy really is." },
        ],
      },
      {
        eyebrow: "Sources",
        title: "What is being reconciled",
        rows: [
          { label: "Usage ledger", value: "Live", detail: "Workflow usage remains tied back to the same underlying ledger that powers platform billing." },
          { label: "Employer programs", value: "Included", detail: "Organization fee statements stay in the reconciliation picture without collapsing into one opaque total." },
          { label: "Correction path", value: "Ready", detail: "If finance needs to amend a mismatch, the correction lane is already visible from the first screen." },
        ],
      },
    ],
    "organization-alerts/continuity-pressure": [
      {
        eyebrow: "Alert",
        title: "Continuity-pressure cluster",
        rows: [
          { label: "Current severity", value: "Elevated", detail: "This alert family is active because employee access restrictions are approaching live commitment deadlines." },
          { label: "Protected employees", value: "7", detail: "The alert should make the actual continuity cohort visible before the operator decides how to intervene." },
          { label: "Nearest risk point", value: "Mar 15 · 4:00 PM", detail: "Time-to-risk belongs on the first screen because it drives the escalation path." },
        ],
      },
      {
        eyebrow: "Response",
        title: "What operators must do next",
        rows: [
          { label: "Primary owner", value: "manager.romero@northstar.example", detail: "The response owner should be explicit so the alert never turns into a cross-team blind spot." },
          { label: "Queue tie-in", value: "northstar-q1-access-window", detail: "Continuity alerts remain tied to the approval and restore window that can actually fix them." },
          { label: "Org trust effect", value: "Tracked", detail: "Repeated destructive access behavior can affect organization trust posture and should be visible here." },
        ],
      },
    ],
    "audit-logs/organization-access-review": [
      {
        eyebrow: "Audit",
        title: "Organization access review posture",
        rows: [
          { label: "Review scope", value: "Access + visibility + restore actions", detail: "This lane should make clear which classes of organization action are under review." },
          { label: "Recent events", value: "184", detail: "The review screen should open on the actual event volume instead of a vague audit status chip." },
          { label: "Export readiness", value: "Compliance ready", detail: "The operator should know whether the current review can already be packaged for external review." },
        ],
      },
      {
        eyebrow: "Traceability",
        title: "Decision integrity",
        rows: [
          { label: "Reason capture", value: "Required", detail: "Revocations, restores, and visibility edits remain tied to explicit reasons in the audit lane." },
          { label: "Reviewer chain", value: "Owner + audit", detail: "Higher-risk access changes stay attributable to named reviewers, not a generic workspace actor." },
          { label: "Correction window", value: "Open", detail: "If access state was applied incorrectly, the review page keeps the correction path visible." },
        ],
      },
    ],
  };
  const activeFocusPanels = pageFocusPanels[currentPageKey] ?? [];
  const pageInsightPanels: Record<
    string,
    Array<{
      title: string;
      eyebrow: string;
      meters?: Array<{ label: string; value: string; detail: string; fill: number }>;
      timeline?: Array<{ time: string; label: string; detail: string; tone?: "live" | "warning" | "default" }>;
    }>
  > = {
    "customers/sovereign-node-1184": [
      {
        eyebrow: "Score shape",
        title: "Reliability mix",
        meters: [
          { label: "Verified completions", value: "72%", detail: "Most recent movement is still being driven by verified follow-through rather than passive age or decay.", fill: 72 },
          { label: "Recovery momentum", value: "61%", detail: "The subject is recovering, but the slope is still softer than the strongest portfolio lane.", fill: 61 },
          { label: "Consent runway", value: "84%", detail: "Current scope still has strong runway before the portfolio loses access to the identity-backed view.", fill: 84 },
        ],
      },
      {
        eyebrow: "Recent events",
        title: "Trajectory timeline",
        timeline: [
          { time: "Mar 05 · 09:12", label: "Verified completion posted", detail: "A clean proof-backed finish raised the subject out of the earlier plateau.", tone: "live" },
          { time: "Feb 23 · 17:40", label: "Early release recorded", detail: "One abandoned commitment still explains the brief downward section in the trend line.", tone: "warning" },
          { time: "Jan 14 · 11:03", label: "Extended consent granted", detail: "Expanded visibility made the deeper trajectory and event view available to the workspace." },
        ],
      },
    ],
    "reports/compliance-audit-package": [
      {
        eyebrow: "Package status",
        title: "Delivery readiness",
        meters: [
          { label: "Assembly progress", value: "82%", detail: "The bounded export, consent ledger, and access history bundle are almost ready to send.", fill: 82 },
          { label: "Delivery confidence", value: "96%", detail: "Signed delivery and mailbox checks are healthy, so the transport path is not the bottleneck.", fill: 96 },
          { label: "Correction window", value: "54%", detail: "There is still time to amend the package cleanly before the correction period closes.", fill: 54 },
        ],
      },
      {
        eyebrow: "Workflow events",
        title: "Report handoff timeline",
        timeline: [
          { time: "Today · 07:52", label: "Package assembly started", detail: "The platform began bundling the export after the scheduled compliance trigger fired.", tone: "live" },
          { time: "Feb 29 · 08:03", label: "Last package delivered", detail: "The previous compliance package reached the delivery mailbox and audit trail cleanly." },
          { time: "Feb 29 · 08:19", label: "Correction lane opened", detail: "A bounded correction window stayed available without breaking the export audit chain." },
        ],
      },
    ],
    "billing-usage/production-underwriting": [
      {
        eyebrow: "Spend mix",
        title: "Project cost distribution",
        meters: [
          { label: "Protected lookups", value: "62%", detail: "This project is still mostly driven by high-volume live trust lookups.", fill: 62 },
          { label: "Reports and exports", value: "21%", detail: "Scheduled reporting is the second-largest contributor to current spend.", fill: 21 },
          { label: "Dashboard + webhooks", value: "17%", detail: "Operator traffic and delivery confirmation still make up a meaningful but smaller share.", fill: 17 },
        ],
      },
      {
        eyebrow: "Billing events",
        title: "Threshold timeline",
        timeline: [
          { time: "Today · 10:30", label: "$4k threshold at 82%", detail: "The workspace is approaching the next billing alert, but still has room to tune the workflow mix.", tone: "warning" },
          { time: "Mar 10 · 15:06", label: "Export cadence review triggered", detail: "The largest scheduled package lane was flagged for operator review before month-end." },
          { time: "Mar 01 · 09:00", label: "Billing period opened", detail: "Project-specific usage tracking and invoice forecasting reset for the new monthly window." },
        ],
      },
    ],
    "workforce-rollout/northstar-launch-q2": [
      {
        eyebrow: "Rollout funnel",
        title: "Employee activation profile",
        meters: [
          { label: "Invites delivered", value: "840", detail: "The initial company-email batch is already out, so the real bottleneck is no longer invite send volume.", fill: 100 },
          { label: "Approved and active", value: "68%", detail: "Most of the cohort is already inside the workspace, but the remaining queue still matters before launch day.", fill: 68 },
          { label: "Wallet-ready employees", value: "38%", detail: "Payroll-linked wallet setup is moving more slowly than approval throughput right now.", fill: 38 },
        ],
      },
      {
        eyebrow: "Launch events",
        title: "Rollout timeline",
        timeline: [
          { time: "Today · 09:05", label: "Company-email wave sent", detail: "The current batch moved into the employee inboxes with role and department tags attached.", tone: "live" },
          { time: "Tomorrow · 13:00", label: "Next checkpoint", detail: "Operations, finance, and managers meet on the next rollout checkpoint before the next approval wave." },
          { time: "Mar 18 · 17:00", label: "Org market launch review", detail: "The organization markets and channel templates are reviewed before the employee cohort fully opens." },
        ],
      },
    ],
    "employee-invites/northstar-wave-3": [
      {
        eyebrow: "Invite signals",
        title: "Delivery and acceptance movement",
        meters: [
          { label: "Delivered", value: "97.9%", detail: "The invite batch is landing cleanly with only a small correction lane still open.", fill: 98 },
          { label: "Opened", value: "82.5%", detail: "Most recipients have seen the invite, which keeps queue growth predictable.", fill: 83 },
          { label: "Accepted", value: "67.5%", detail: "Roughly two thirds of the invite wave has already moved into account creation or approval state.", fill: 68 },
        ],
      },
      {
        eyebrow: "Invite events",
        title: "Batch timeline",
        timeline: [
          { time: "Today · 08:10", label: "Wave delivered", detail: "The new batch started landing across Northstar company inboxes.", tone: "live" },
          { time: "Today · 09:02", label: "First acceptance surge", detail: "Managers in Warehouse Operations accepted quickly after the invite landed.", tone: "live" },
          { time: "Today · 09:40", label: "Bounce cluster isolated", detail: "Five stale aliases were flagged for correction before the next resend window.", tone: "warning" },
        ],
      },
    ],
    "company-email-access/pending-employer-approval": [
      {
        eyebrow: "Pending signals",
        title: "Waiting-state behavior",
        meters: [
          { label: "Queue matched", value: "100%", detail: "The employee request is already attached to the live company-email approval queue.", fill: 100 },
          { label: "Realtime updates", value: "On", detail: "The waiting state listens for approval changes instead of leaving the employee in a stale view.", fill: 100 },
          { label: "Support deflection", value: "Low", detail: "Clear employee-side state should reduce unnecessary support loops while approval is still pending.", fill: 28 },
        ],
      },
      {
        eyebrow: "Pending events",
        title: "Employee-side timeline",
        timeline: [
          { time: "Today · 10:11", label: "Company email recognized", detail: "The account was matched to Northstar Logistics automatically." },
          { time: "Today · 10:12", label: "Request submitted", detail: "The employee requested manager-level access through the pending-approval flow." },
          { time: "Waiting", label: "Manager review", detail: "The request is visible in the active approval queue and ready for a decision.", tone: "warning" },
        ],
      },
    ],
    "organization-onboarding/northstar-managed-account": [
      {
        eyebrow: "Managed launch",
        title: "Onboarding quality signals",
        meters: [
          { label: "Role disclosure", value: "Complete", detail: "Role, visibility, and workspace routing are all disclosed before activation.", fill: 100 },
          { label: "Program readiness", value: "86%", detail: "The first markets and channels for this onboarding path are nearly ready.", fill: 86 },
          { label: "Workspace routing", value: "Ready", detail: "Employees can be sent directly into the organization workspace after approval.", fill: 100 },
        ],
      },
      {
        eyebrow: "Onboarding events",
        title: "Template timeline",
        timeline: [
          { time: "Today · 07:30", label: "Template published", detail: "The managed-account onboarding template was approved for Northstar rollout." },
          { time: "Today · 08:55", label: "Visibility disclosure confirmed", detail: "The employee-facing visibility policy copy and audit state were finalized.", tone: "live" },
          { time: "Next checkpoint · Mar 18", label: "Go-live review", detail: "The rollout owner will confirm first-market and first-channel readiness before launch." },
        ],
      },
    ],
    "managed-visibility/northstar-full-managed-visibility": [
      {
        eyebrow: "Visibility quality",
        title: "Policy and disclosure stability",
        meters: [
          { label: "Disclosure coverage", value: "100%", detail: "All employees governed by this template have been shown the visibility disclosure.", fill: 100 },
          { label: "Audit completeness", value: "100%", detail: "Every template change and acknowledgment remains tied to an audit trail.", fill: 100 },
          { label: "Manager scope clarity", value: "92%", detail: "Most manager review paths are clear, but one narrower scope variant still needs cleanup.", fill: 92 },
        ],
      },
      {
        eyebrow: "Visibility events",
        title: "Template timeline",
        timeline: [
          { time: "Mar 10 · 11:06", label: "Template revised", detail: "The current managed visibility template replaced the older operations-only version." },
          { time: "Mar 10 · 11:14", label: "Disclosure republished", detail: "Employees entering the workspace after the change now see the updated scope.", tone: "live" },
          { time: "Today · 09:25", label: "Audit export prepared", detail: "A fresh audit package is ready if the organization needs to prove the current disclosure history." },
        ],
      },
    ],
    "continuity-access/jordan-lee-restriction-window": [
      {
        eyebrow: "Continuity signals",
        title: "Restriction and restore pressure",
        meters: [
          { label: "Protected access", value: "Enabled", detail: "The employee still has the minimum market and proof access required to finish active commitments.", fill: 100 },
          { label: "Restore urgency", value: "72%", detail: "The restore window is tightening and should stay visible to the organization owner.", fill: 72 },
          { label: "Deadline exposure", value: "1 proof lane", detail: "Only one proof path is currently at risk, but that is enough to require active monitoring.", fill: 25 },
        ],
      },
      {
        eyebrow: "Continuity events",
        title: "Restriction timeline",
        timeline: [
          { time: "Today · 08:42", label: "Restriction applied", detail: "Broader organization access was reduced while continuity protection remained active.", tone: "warning" },
          { time: "Today · 08:45", label: "Continuity mode confirmed", detail: "The employee kept active-market access, reminders, and proof eligibility.", tone: "live" },
          { time: "Mar 15 · 16:00", label: "Restore deadline", detail: "Full continuity risk increases if the organization has not restored the account by this point.", tone: "warning" },
        ],
      },
    ],
    "employee-access-queue/northstar-q1-access-window": [
      {
        eyebrow: "Queue profile",
        title: "Approval pressure split",
        meters: [
          { label: "Bulk-safe approvals", value: "29", detail: "Most of the queue can move quickly without extra role review.", fill: 63 },
          { label: "Manual review required", value: "10", detail: "These requests still need manager or policy review before they can enter the workspace.", fill: 22 },
          { label: "Continuity-risk employees", value: "7", detail: "These employees still have active commitments, so destructive lockout is not allowed.", fill: 15 },
        ],
      },
      {
        eyebrow: "Queue events",
        title: "Access and restore timeline",
        timeline: [
          { time: "Today · 08:42", label: "New request burst detected", detail: "A fresh signup wave increased the queue and triggered the current review window.", tone: "live" },
          { time: "Mar 15 · 16:00", label: "Nearest restore deadline", detail: "One restricted employee must regain continuity access before the next proof window closes.", tone: "warning" },
          { time: "Mar 10 · 14:18", label: "Manager review assigned", detail: "The current queue owner accepted the review batch and the approval lane became active." },
        ],
      },
    ],
    employees: [
      {
        eyebrow: "Roster shape",
        title: "Employee directory mix",
        meters: [
          { label: "Active employees", value: "85%", detail: "Most company-managed accounts are already active inside the workspace.", fill: 85 },
          { label: "Pending approvals", value: "5%", detail: "A smaller but meaningful slice still needs company review before entry is granted.", fill: 5 },
          { label: "Continuity access", value: "1%", detail: "A protected subset still has active commitments and reduced org access.", fill: 1 },
        ],
      },
      {
        eyebrow: "Directory events",
        title: "Roster timeline",
        timeline: [
          { time: "Today · 09:18", label: "Employee roster synced", detail: "The organization directory refreshed after the latest company-email signup and invite wave.", tone: "live" },
          { time: "Today · 08:42", label: "Approval queue burst", detail: "A new request wave increased pending employees and updated manager-owned team lanes.", tone: "warning" },
          { time: "Mar 10 · 11:06", label: "Managed visibility policy updated", detail: "The organization confirmed its current managed visibility template for employee accounts." },
        ],
      },
    ],
    "employees/jordan-lee": [
      {
        eyebrow: "Trajectory",
        title: "Employee reliability shape",
        meters: [
          { label: "Completion rate", value: "88%", detail: "The employee’s recent record is still mostly driven by clean follow-through.", fill: 88 },
          { label: "Recovery strength", value: "64%", detail: "One earlier miss has been partially offset by the most recent completion streak.", fill: 64 },
          { label: "Org-program participation", value: "73%", detail: "Most current activity is happening inside the organization’s own market programs.", fill: 73 },
        ],
      },
      {
        eyebrow: "Recent events",
        title: "Employee event timeline",
        timeline: [
          { time: "Today · 08:20", label: "Organization market joined", detail: "The employee entered a new operations market tied to the current warehouse program.", tone: "live" },
          { time: "Mar 08 · 18:05", label: "Proof accepted", detail: "A proof-backed finish closed the latest fulfillment commitment cleanly.", tone: "live" },
          { time: "Feb 27 · 09:10", label: "Manager note logged", detail: "A manager review note was attached after one missed commitment in the prior cycle.", tone: "warning" },
        ],
      },
    ],
    "payroll-and-wallet/northstar-direct-deposit-rollout": [
      {
        eyebrow: "Enrollment",
        title: "Payroll adoption funnel",
        meters: [
          { label: "Eligible employees", value: "820", detail: "The program is open to the full organization cohort tied to the current rollout.", fill: 100 },
          { label: "Direct-deposit enrolled", value: "38%", detail: "Enrollment is moving, but still trails the broader employee approval pace.", fill: 38 },
          { label: "Payout rails connected", value: "67%", detail: "Most enrolled users already have a withdrawal or payout path configured.", fill: 67 },
        ],
      },
      {
        eyebrow: "Program events",
        title: "Funding and wallet timeline",
        timeline: [
          { time: "Today · 07:30", label: "Payroll enrollment sync", detail: "The latest direct-deposit enrollments were written into the program summary and finance lane.", tone: "live" },
          { time: "Mar 15 · 09:00", label: "Next payroll window", detail: "The next payroll-linked funding event is already scheduled and visible to operations.", tone: "warning" },
          { time: "Mar 01 · 12:10", label: "Wallet policy notice accepted", detail: "The latest employee cohort acknowledged the Continuity Key and local wallet boundary during setup." },
        ],
      },
    ],
    "organization-workspace": [
      {
        eyebrow: "Workspace signals",
        title: "Organization operating health",
        meters: [
          { label: "Employee coverage", value: "89%", detail: "Most eligible employees are already inside the managed workspace and visible to the org operators.", fill: 89 },
          { label: "Program activation", value: "67%", detail: "Most current organization programs are active, but two still need launch cleanup before the next wave.", fill: 67 },
          { label: "Continuity pressure", value: "14%", detail: "A smaller but meaningful slice of the workspace still needs continuity-aware intervention.", fill: 14 },
        ],
      },
      {
        eyebrow: "Workspace events",
        title: "Operator timeline",
        timeline: [
          { time: "Today · 08:42", label: "Approval queue expanded", detail: "A new company-email wave increased pending access and raised continuity monitoring needs.", tone: "warning" },
          { time: "Today · 09:18", label: "Employee directory synced", detail: "The organization roster refreshed after the latest approval and invite movements.", tone: "live" },
          { time: "Today · 10:05", label: "Program health recalculated", detail: "Workspace-level employee, market, and billing metrics were recomputed for the daily operating view." },
        ],
      },
    ],
    "organization-workspace/northstar-central-ops": [
      {
        eyebrow: "Central ops",
        title: "Northstar central operations health",
        meters: [
          { label: "Manager coverage", value: "93%", detail: "Nearly every active team lane has a live manager owner attached in the current workspace.", fill: 93 },
          { label: "Approval backlog", value: "46 requests", detail: "Pending access remains the clearest source of operational pressure in this workspace.", fill: 46 },
          { label: "Program stability", value: "81%", detail: "Most organization programs are stable, but one warehouse lane still needs attention before the next checkpoint.", fill: 81 },
        ],
      },
      {
        eyebrow: "Central ops events",
        title: "Workspace timeline",
        timeline: [
          { time: "Today · 07:55", label: "Operations digest published", detail: "The daily organization summary landed for ops, people, and finance leads.", tone: "live" },
          { time: "Today · 08:42", label: "Queue surge detected", detail: "A new employee-access burst increased the central queue load.", tone: "warning" },
          { time: "Tomorrow · 13:00", label: "Cross-functional checkpoint", detail: "Ops, people, and finance owners review workspace health before the next launch wave." },
        ],
      },
    ],
    "manager-views": [
      {
        eyebrow: "Manager signals",
        title: "Team-lane pressure",
        meters: [
          { label: "Healthy teams", value: "5 of 8", detail: "Most manager-owned lanes are running cleanly without restore or proof-pressure issues.", fill: 63 },
          { label: "Attention required", value: "3 lanes", detail: "Three teams still need active approval, continuity, or proof-deadline intervention.", fill: 38 },
          { label: "Manager review cadence", value: "Daily", detail: "Manager-owned lanes are being revisited often enough to keep the org feed current.", fill: 100 },
        ],
      },
      {
        eyebrow: "Manager events",
        title: "Team timeline",
        timeline: [
          { time: "Today · 08:22", label: "Warehouse lane escalated", detail: "Warehouse Operations surfaced the most urgent combination of approvals and active commitments.", tone: "warning" },
          { time: "Today · 09:10", label: "Two team lanes cleared", detail: "Two lower-risk teams completed their pending approvals and dropped out of the urgent queue.", tone: "live" },
          { time: "Today · 09:45", label: "Next review wave assigned", detail: "Managers received the next scoped set of review items from central operations." },
        ],
      },
    ],
    "manager-views/warehouse-operations": [
      {
        eyebrow: "Warehouse signals",
        title: "Warehouse operations lane",
        meters: [
          { label: "Active commitments", value: "74", detail: "The team lane is carrying a meaningful volume of live commitments that need clean continuity handling.", fill: 74 },
          { label: "Pending approvals", value: "18", detail: "Access approvals are still the primary source of operational friction for this manager lane.", fill: 18 },
          { label: "Proof-window exposure", value: "1 elevated", detail: "One active proof lane remains at risk and should stay visible until resolved.", fill: 25 },
        ],
      },
      {
        eyebrow: "Warehouse events",
        title: "Team timeline",
        timeline: [
          { time: "Today · 08:20", label: "Org market joined", detail: "One managed employee joined a new warehouse operations market.", tone: "live" },
          { time: "Today · 08:42", label: "Approval backlog increased", detail: "The team queue grew as the newest employee wave hit company-email review.", tone: "warning" },
          { time: "Today · 10:30", label: "Manager review due", detail: "The next manager-owned review window is due before the afternoon proof reminders go out." },
        ],
      },
    ],
    "organization-fees": [
      {
        eyebrow: "Economics signals",
        title: "Employer-side fee posture",
        meters: [
          { label: "Live programs", value: "3", detail: "Three employer-facing economics lanes are currently active and tracked separately from core platform fees.", fill: 100 },
          { label: "Statement readiness", value: "91%", detail: "Most organization fee statements are clean and ready for export this cycle.", fill: 91 },
          { label: "Margin protection", value: "100%", detail: "Current program settings are staying inside the platform’s protected economics guardrails.", fill: 100 },
        ],
      },
      {
        eyebrow: "Economics events",
        title: "Fee-lane timeline",
        timeline: [
          { time: "Today · 07:40", label: "Program share statement prepared", detail: "The latest employer program economics package is ready for billing review.", tone: "live" },
          { time: "Today · 09:15", label: "Revenue-share audit rechecked", detail: "The organization fee lane was revalidated against the current billing posture." },
          { time: "Month end · Pending", label: "Statement export window", detail: "The employer-facing fee statements will lock for the month-end billing cycle.", tone: "warning" },
        ],
      },
    ],
    "organization-fees/northstar-program-share": [
      {
        eyebrow: "Program share signals",
        title: "Northstar program share health",
        meters: [
          { label: "Program coverage", value: "82%", detail: "Most eligible organization-market activity is already landing in the current fee program cleanly.", fill: 82 },
          { label: "Billing clarity", value: "95%", detail: "The employer-facing statement lane is nearly fully reconciled for this program.", fill: 95 },
          { label: "Core-fee protection", value: "100%", detail: "The separate employer economics lane is not eroding Sovereign Spark or the core platform margin.", fill: 100 },
        ],
      },
      {
        eyebrow: "Program share events",
        title: "Program timeline",
        timeline: [
          { time: "Today · 07:42", label: "Monthly statement compiled", detail: "The program-level statement was assembled for the current month.", tone: "live" },
          { time: "Today · 08:55", label: "Program participation refreshed", detail: "Organization-market participation rolled forward into the current economics view." },
          { time: "Tomorrow · 11:00", label: "Finance review window", detail: "Northstar finance reviews the program share statement before the next billing sync." },
        ],
      },
    ],
    "roles-permissions/manager-control-pack": [
      {
        eyebrow: "Permission signals",
        title: "Control-pack stability",
        meters: [
          { label: "Assigned managers", value: "18", detail: "The control pack is already active across the current manager-owned team views.", fill: 100 },
          { label: "Audit coverage", value: "100%", detail: "Every assignment, change, and use remains attached to the organization audit trail.", fill: 100 },
          { label: "Escalation escapes", value: "0", detail: "No out-of-policy elevation attempts are currently bypassing the expected approval path.", fill: 100 },
        ],
      },
      {
        eyebrow: "Permission events",
        title: "Control-pack timeline",
        timeline: [
          { time: "Today · 07:48", label: "Pack assigned to warehouse managers", detail: "The manager-control-pack was attached to the latest team-owner cohort.", tone: "live" },
          { time: "Today · 08:52", label: "Restore authority exercised", detail: "A manager used the pack to preserve continuity access for one active employee.", tone: "warning" },
          { time: "Mar 10 · 11:06", label: "Role template reviewed", detail: "The control pack was revalidated against the current visibility and continuity rules." },
        ],
      },
    ],
    "reports/operations-digest": [
      {
        eyebrow: "Digest signals",
        title: "Operating-summary coverage",
        meters: [
          { label: "People coverage", value: "Full roster", detail: "The digest is already reflecting approval, restore, and managed employee movement across the whole organization.", fill: 100 },
          { label: "Program coverage", value: "6 programs", detail: "The digest is summarizing the active organization-market and payroll program lanes together.", fill: 100 },
          { label: "Issue pressure", value: "Moderate", detail: "The current digest still surfaces a manageable but real queue and continuity burden.", fill: 58 },
        ],
      },
      {
        eyebrow: "Digest events",
        title: "Digest timeline",
        timeline: [
          { time: "Today · 07:55", label: "Daily digest published", detail: "The cross-functional operations digest was delivered to ops, people, and finance owners.", tone: "live" },
          { time: "Today · 08:42", label: "Approval pressure highlighted", detail: "The digest flagged the queue surge as the top operating issue to clear first.", tone: "warning" },
          { time: "Tomorrow · 07:30", label: "Next digest scheduled", detail: "The next organization operating summary is already queued for delivery." },
        ],
      },
    ],
    "reports/billing-reconciliation": [
      {
        eyebrow: "Reconciliation signals",
        title: "Billing-close health",
        meters: [
          { label: "Ledger match", value: "96%", detail: "Most billing sources are reconciling cleanly across platform usage, exports, and employer programs.", fill: 96 },
          { label: "Exception pressure", value: "2 items", detail: "Only two mismatches remain, but they still need operator review before the statement closes.", fill: 24 },
          { label: "Correction readiness", value: "78%", detail: "Finance still has a clean correction lane before month-end lock.", fill: 78 },
        ],
      },
      {
        eyebrow: "Reconciliation events",
        title: "Billing timeline",
        timeline: [
          { time: "Today · 07:44", label: "Reconciliation run started", detail: "The month-to-date close routine began across usage, exports, and employer program statements.", tone: "live" },
          { time: "Today · 08:31", label: "Variance cluster isolated", detail: "Two mismatches were traced back to one export lane and one employer statement.", tone: "warning" },
          { time: "Tomorrow · 10:00", label: "Finance close review", detail: "Finance reviews the final reconciliation state before the next invoice snapshot." },
        ],
      },
    ],
    "organization-alerts/continuity-pressure": [
      {
        eyebrow: "Alert signals",
        title: "Continuity-risk movement",
        meters: [
          { label: "Protected employees", value: "7", detail: "Seven employees still rely on continuity access to finish active commitments safely.", fill: 100 },
          { label: "Restore urgency", value: "72%", detail: "The alert remains elevated because one restore deadline is getting close.", fill: 72 },
          { label: "Manager coverage", value: "93%", detail: "Most affected lanes already have an active manager owner attached.", fill: 93 },
        ],
      },
      {
        eyebrow: "Alert events",
        title: "Continuity timeline",
        timeline: [
          { time: "Today · 08:42", label: "Continuity alert opened", detail: "The platform detected active commitments at risk if restore actions lag further.", tone: "warning" },
          { time: "Today · 09:06", label: "Owner escalation sent", detail: "The alert was routed to the current manager owner and organization workspace lead.", tone: "live" },
          { time: "Mar 15 · 16:00", label: "Nearest restore deadline", detail: "The first high-risk window closes if protected access has not been restored or resolved by then.", tone: "warning" },
        ],
      },
    ],
    "audit-logs/organization-access-review": [
      {
        eyebrow: "Audit signals",
        title: "Access-review integrity",
        meters: [
          { label: "Reason capture", value: "100%", detail: "Every access change in this review window carries a stored reason and actor chain.", fill: 100 },
          { label: "Review throughput", value: "184 events", detail: "The review is handling a meaningful volume of access and visibility decisions without losing traceability.", fill: 88 },
          { label: "Export readiness", value: "92%", detail: "The audit package is nearly ready for compliance export with only one correction item left.", fill: 92 },
        ],
      },
      {
        eyebrow: "Audit events",
        title: "Access-review timeline",
        timeline: [
          { time: "Today · 07:36", label: "Review window opened", detail: "The organization access audit began for the latest visibility, restore, and revocation cycle.", tone: "live" },
          { time: "Today · 08:17", label: "Continuity override logged", detail: "One restriction path was corrected into continuity access before it could strand active commitments.", tone: "warning" },
          { time: "Today · 09:24", label: "Compliance export prepared", detail: "The current audit slice is nearly ready to move into the compliance package lane." },
        ],
      },
    ],
  };
  const activeInsightPanels = pageInsightPanels[currentPageKey] ?? [];

  return (
    <section className="auth-screen docs-experience-screen developer-portal-screen">
      <div className="auth-screen-grid docs-experience-grid-shell">
        <div className="auth-brand-hero docs-experience-brand">
          <Link aria-label="PayToCommit developer platform" className="auth-brand-link" href={homeHref}>
            <BrandLockup />
          </Link>
        </div>

        <div className="docs-experience-panel developer-portal-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="docs-experience-panel-core">
            <div className="docs-experience-panel-head">
              <div className="developer-portal-host-strip">
                <Link className="developer-portal-host-link is-active" href={hostHomeHref}>
                  <span className="mono-label">{hostMode === "platform" ? "Platform host" : "Developer host"}</span>
                  <strong>{hostMode === "platform" ? "platform.paytocommit.com" : "developers.paytocommit.com"}</strong>
                </Link>
                <Link className="developer-portal-host-link" href={companionHostHref}>
                  <span className="mono-label">Companion surface</span>
                  <strong>{companionHostLabel}</strong>
                </Link>
              </div>

              <div className="section-stack section-stack-tight docs-experience-head">
                <span className="funding-state-chip">{headingLabel}</span>
                <h1 className="docs-experience-title">{title}</h1>
                <p className="docs-experience-subtitle">{subtitle}</p>
              </div>

              <label className="docs-experience-search">
                <Search aria-hidden="true" size={18} />
                <input
                  aria-label="Search developer portal"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div className="developer-portal-operator-strip">
              {operatorMetrics.map((metric) => (
                <div key={metric.label} className="developer-portal-operator-card">
                  <span className="mono-label">{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="docs-experience-summary-strip">
              <div className="docs-experience-summary-card">
                <span className="mono-label">Accounts</span>
                <strong>Workspace access</strong>
                <p>Developers sign in, create workspaces, request sandbox access, and manage production credentials from the same place.</p>
              </div>
              <div className="docs-experience-summary-card">
                <span className="mono-label">Portal search</span>
                <strong>{resultCountLabel}</strong>
                <p>Quickstarts, reference, dashboards, pricing, and troubleshooting update live as you type.</p>
              </div>
              <div className="docs-experience-summary-card">
                <span className="mono-label">HRS API</span>
                <strong>Consent scoped</strong>
                <p>Legal-name-backed reliability access stays purpose-bound, auditable, and filterable by active scope.</p>
              </div>
              <div className="docs-experience-summary-card">
                <span className="mono-label">Usage billing</span>
                <strong>Metered, exportable</strong>
                <p>Billing tracks protected lookups, report jobs, exports, and heavier dashboard workflows.</p>
              </div>
              <div className="docs-experience-summary-card">
                <span className="mono-label">Platform workspace</span>
                <strong>Dashboard + reports</strong>
                <p>Customer drill-down, webhook health, organization usage, exports, and audit views live in one place.</p>
              </div>
            </div>

            {hostMode === "platform" ? (
              <>
                <div className="developer-portal-workspace-grid">
                  <div className="developer-portal-workspace-card developer-portal-session-card">
                    <span className="mono-label">Workspace access</span>
                    <strong>{isAuthenticated ? "Signed in to platform workspace" : "Sign in to start a workspace"}</strong>
                    <p>
                      {isAuthenticated
                        ? `${viewerEmail} is ready to move through organization setup, project creation, key management, customer drill-down, and production review.`
                        : "Create a developer account first, then create an organization workspace and the first sandbox project from the same platform surface."}
                    </p>
                    <div className="developer-portal-session-meta">
                      <span>{isAuthenticated ? viewerEmail : "No active workspace session"}</span>
                      <span>{isAuthenticated ? "Projects, keys, reports, and billing are now one click away." : "Account first, workspace second, production review last."}</span>
                    </div>
                  </div>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["organizations"], hostMode)}>
                    <span className="mono-label">Organizations</span>
                    <strong>Create the operating workspace</strong>
                    <p>Define the organization, invite the right people, and separate technical, billing, and audit ownership cleanly.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["projects"], hostMode)}>
                    <span className="mono-label">Projects</span>
                    <strong>Create sandbox and production lanes</strong>
                    <p>Split work by environment and use case so keys, usage, webhooks, and reports stay legible for the whole team.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["api-keys"], hostMode)}>
                    <span className="mono-label">API keys</span>
                    <strong>Name, scope, and rotate secrets</strong>
                    <p>Create the first server-side key, track usage by project, and keep cutovers clean when secrets rotate.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["playground"], hostMode)}>
                    <span className="mono-label">Playground</span>
                    <strong>Run the first protected lookup</strong>
                    <p>Test a real HRS call, inspect consent metadata, and confirm the result appears in the audit log.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["workforce-rollout"], hostMode)}>
                    <span className="mono-label">Workforce rollout</span>
                    <strong>Invite employees by company email</strong>
                    <p>Open the employee queue, send company-email invites, and move people into organization onboarding without leaving the workspace.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["employee-invites"], hostMode)}>
                    <span className="mono-label">Employee invites</span>
                    <strong>Send roster waves cleanly</strong>
                    <p>Run single, bulk, and CSV-backed invite waves with role templates, company-email routing, and branded delivery state.</p>
                  </Link>
                  <Link className="developer-portal-workspace-card" href={getDeveloperPortalPath(["organization-onboarding"], hostMode)}>
                    <span className="mono-label">Org onboarding</span>
                    <strong>Shape the managed first run</strong>
                    <p>Disclose visibility, route employees into the right workspace, and attach first programs before activation.</p>
                  </Link>
                </div>

                <div className="developer-portal-dashboard-grid">
                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Workspace health</strong>
                      <span className="mono-label">Live summary</span>
                    </div>
                    <div className="developer-portal-health-grid">
                      {workspaceHealthCards.map((card) => (
                        <div key={card.label} className="developer-portal-health-card">
                          <span className="mono-label">{card.label}</span>
                          <strong>{card.value}</strong>
                          <p>{card.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Recent alerts</strong>
                      <span className="developer-portal-dashboard-chip">
                        <BellDot aria-hidden="true" size={14} />
                        Reviewed
                      </span>
                    </div>
                    <div className="developer-portal-list">
                      {workspaceAlerts.map((alert) => (
                        <div key={alert} className="developer-portal-list-row">
                          <BellDot aria-hidden="true" size={15} />
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Customer portfolio</strong>
                      <span className="developer-portal-dashboard-chip">
                        <Users aria-hidden="true" size={14} />
                        Drill-down ready
                      </span>
                    </div>
                    <div className="developer-portal-list">
                      {customerPortfolio.map((customer) => (
                        <Link key={customer.name} className="developer-portal-list-link" href={customer.href}>
                          <strong>{customer.name}</strong>
                          <span>{customer.detail}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Workforce rollout</strong>
                      <span className="developer-portal-dashboard-chip">
                        <Users aria-hidden="true" size={14} />
                        Company email
                      </span>
                    </div>
                    <div className="developer-portal-list">
                      {workforcePortfolio.map((item) => (
                        <Link key={item.name} className="developer-portal-list-link" href={item.href}>
                          <strong>{item.name}</strong>
                          <span>{item.detail}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Rollout checklist</strong>
                      <span className="mono-label">Operator path</span>
                    </div>
                    <div className="developer-portal-list">
                      {workforceRolloutChecklist.map((item, index) => (
                        <div key={item} className="developer-portal-list-row">
                          <span className="developer-portal-step-index">{index + 1}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="developer-portal-dashboard-card">
                    <div className="developer-portal-dashboard-head">
                      <strong>Key health</strong>
                      <span className="developer-portal-dashboard-chip">
                        <KeyRound aria-hidden="true" size={14} />
                        Server-side only
                      </span>
                    </div>
                    <div className="developer-portal-list">
                      {keyHealth.map((item) => (
                        <div key={item} className="developer-portal-list-row">
                          <ShieldCheck aria-hidden="true" size={15} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <div className="docs-experience-shortcuts">
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["account-access"], hostMode)}>
                <span className="mono-label">Workspace</span>
                <strong>Developer accounts</strong>
                <p>Sign in, create a workspace, request sandbox approval, and step into production from one operating surface.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["organizations"], hostMode)}>
                <span className="mono-label">Organizations</span>
                <strong>Roles and billing access</strong>
                <p>Bring in technical leads, security owners, and finance contacts without collapsing everything into one credential.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["projects"], hostMode)}>
                <span className="mono-label">Projects</span>
                <strong>Sandbox and production shape</strong>
                <p>Mirror the way real API teams work by isolating environments, integrations, and usage by project.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["api-keys"], hostMode)}>
                <span className="mono-label">Keys</span>
                <strong>Create the first API key</strong>
                <p>Name, scope, and store the first key correctly so audit history and billing stay understandable later.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["playground"], hostMode)}>
                <span className="mono-label">Playground</span>
                <strong>Test a live request</strong>
                <p>Run the first protected HRS call, inspect the payload, and confirm the key and consent scope are wired correctly.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["quickstarts"], hostMode)}>
                <span className="mono-label">Quickstarts</span>
                <strong>Sandbox to first lookup</strong>
                <p>Set up sandbox access, run the first protected lookup, verify webhooks, and move to production review.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["sandbox-access"], hostMode)}>
                <span className="mono-label">Sandbox</span>
                <strong>Request sandbox access</strong>
                <p>Get the first approved key, test subjects, and webhook access before you ask for production.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["production-review"], hostMode)}>
                <span className="mono-label">Production</span>
                <strong>Prepare for go-live</strong>
                <p>Clear consent review, billing setup, webhook verification, and audit readiness before live traffic starts.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["hrs-api"], hostMode)}>
                <span className="mono-label">Core API</span>
                <strong>Human Reliability API</strong>
                <p>Consent-scoped HRS retrieval, trend history, and enterprise-safe customer detail access.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["platform-dashboard"], hostMode)}>
                <span className="mono-label">Dashboard</span>
                <strong>Master platform workspace</strong>
                <p>Portfolio health, webhook delivery, export jobs, billing, and customer-level reliability drill-downs.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["workforce-rollout"], hostMode)}>
                <span className="mono-label">Workforce</span>
                <strong>Invite employees and launch company onboarding</strong>
                <p>Send company-email invites, attach employees to the right organization, and turn on enterprise markets without adding signup friction.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["employee-invites"], hostMode)}>
                <span className="mono-label">Invites</span>
                <strong>Run employee invite waves</strong>
                <p>Move from one-off company-email invites to CSV-backed roster uploads without losing role, team, or onboarding state.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["company-email-access"], hostMode)}>
                <span className="mono-label">States</span>
                <strong>Handle pending, blocked, and continuity access</strong>
                <p>Keep employee-side access states explainable while preserving the admin-side policy and continuity controls behind them.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["organization-onboarding"], hostMode)}>
                <span className="mono-label">Onboarding</span>
                <strong>Route employees into the right workspace</strong>
                <p>Show role, visibility policy, and first organization programs before the company-managed account goes live.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["employee-access-queue"], hostMode)}>
                <span className="mono-label">Access</span>
                <strong>Review the employee approval queue</strong>
                <p>Search pending signups, approve in batches, and apply temporary restrictions without orphaning active commitments.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["payroll-and-wallet"], hostMode)}>
                <span className="mono-label">Payroll</span>
                <strong>Roll out wallet-linked direct deposit</strong>
                <p>Review payroll-connected funding, employee wallet entry, and employer reporting without confusing payroll with normal wallet ownership.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["customers"], hostMode)}>
                <span className="mono-label">Customers</span>
                <strong>Consent-scoped customer drill-downs</strong>
                <p>Open the customer portfolio, inspect trend history, and work from a real organization dashboard.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["reports"], hostMode)}>
                <span className="mono-label">Reports</span>
                <strong>Exports, cohorts, and audit packages</strong>
                <p>Queue reports, run exports, and keep compliance-ready packages close to the dashboard.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["webhooks"], hostMode)}>
                <span className="mono-label">Webhooks</span>
                <strong>Signatures and retries</strong>
                <p>Signed delivery, replay protection, retry handling, and endpoint health verification.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["pricing"], hostMode)}>
                <span className="mono-label">Billing</span>
                <strong>Usage-based pricing</strong>
                <p>Protected lookup volume, exports, reports, and threshold-driven billing visibility.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["audit-logs"], hostMode)}>
                <span className="mono-label">Audit</span>
                <strong>Access history and scope review</strong>
                <p>Trace consent-backed lookups, exports, scope changes, and high-sensitivity admin actions without leaving the platform.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href={getDeveloperPortalPath(["strategic-partners"], hostMode)}>
                <span className="mono-label">Partners</span>
                <strong>Strategic partner packages</strong>
                <p>Optional flagship launch pages, case studies, and co-branded rollout support for negotiated enterprise accounts.</p>
              </Link>
              <Link className="docs-experience-result docs-experience-shortcut" href="/sales">
                <span className="mono-label">Enterprise</span>
                <strong>Sales and approvals</strong>
                <p>Enterprise application review, consent expectations, use-case intake, and integration readiness.</p>
              </Link>
            </div>

            <div className="developer-portal-action-row">
              <Link className="action-primary" href={isAuthenticated ? getDeveloperPortalPath(["platform-dashboard"], hostMode) : "/login"}>
                {isAuthenticated ? "Open platform dashboard" : "Sign in to workspace"}
              </Link>
              <Link className="action-secondary" href={isAuthenticated ? getDeveloperPortalPath(["projects"], hostMode) : "/signup"}>
                {isAuthenticated ? "Create first project" : "Create developer account"}
              </Link>
              <Link className="action-secondary" href="/sales">
                Request enterprise access
              </Link>
            </div>

            {hostMode === "platform" ? (
              <div className="developer-portal-onboarding-strip">
                <div className="developer-portal-onboarding-head">
                  <span className="mono-label">First hour in the platform</span>
                  <strong>{isAuthenticated ? "Your workspace can move straight into projects, keys, and test calls." : "The onboarding path mirrors how real API teams actually get started."}</strong>
                </div>
                <div className="developer-portal-onboarding-grid">
                  {onboardingSteps.map((step, index) => (
                    <Link
                      key={step.label}
                      className={`developer-portal-onboarding-step${index < currentOnboardingStep ? " is-complete" : ""}${index === currentOnboardingStep ? " is-active" : ""}`}
                      href={step.href}
                    >
                      <span className="developer-portal-onboarding-index">{index + 1}</span>
                      <strong>{step.label}</strong>
                      <p>{step.detail}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {hostMode === "platform" || currentPage.group === "Operations" ? (
              <div className="developer-portal-surface-grid">
                {platformSurfaceCards.map((card) => (
                  <Link key={card.href} className="developer-portal-surface-card" href={card.href}>
                    <span className="mono-label">{card.label}</span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="docs-experience-layout">
              <aside className="docs-experience-nav">
                <div className="docs-experience-nav-intro">
                  <span className="mono-label">Developer surface</span>
                  <strong>Use quickstarts for setup, reference for endpoints, and the platform workspace for day-to-day operations.</strong>
                  <p>
                    This portal follows the patterns strong developer surfaces use: persistent navigation, search-first docs, dashboard entry, billing visibility, and direct troubleshooting paths.
                  </p>
                </div>
                <div className="docs-experience-nav-intro">
                  <span className="mono-label">Critical help</span>
                  <strong>Identity, funding, payout, and enterprise support stay reachable.</strong>
                  <p>
                    Direct Galactus conversation can still be gated, but support, intake, and critical operational help stay publicly reachable.
                  </p>
                </div>
                {Object.entries(groupedPages).map(([group, groupPages]) => {
                  const isOpen = openGroups[group] ?? true;

                  return (
                    <div key={group} className="docs-experience-nav-group">
                      <button
                        aria-expanded={isOpen ? "true" : "false"}
                        className="docs-experience-nav-toggle"
                        onClick={() => toggleGroup(group)}
                        type="button"
                      >
                        <span className="docs-experience-nav-meta">
                          <span className="mono-label">{group}</span>
                          <span className="docs-count-pill">{groupCounts[group] ?? groupPages.length}</span>
                        </span>
                        <ChevronDown aria-hidden="true" className={isOpen ? "is-open" : ""} size={14} />
                      </button>
                      <div className={`docs-experience-nav-links ${isOpen ? "is-open" : ""}`}>
                        {groupPages.map((page) => {
                          const href = getDeveloperPortalPath(page.slug, hostMode);
                          const isActive = getPageKey(page.slug) === getPageKey(currentPage.slug);

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
                    </div>
                  );
                })}
              </aside>

              <div className="docs-experience-content">
                <article className="docs-experience-article">
                  <div className="docs-experience-current">
                    <div className="section-stack section-stack-tight">
                      <span className="mono-label">{currentPage.eyebrow}</span>
                      <h2 className="docs-experience-article-title">{currentPage.title}</h2>
                      <p className="docs-experience-subtitle">{currentPage.summary}</p>
                    </div>
                    <span className="status-pill" data-tone="live">
                      {currentPage.group}
                    </span>
                  </div>

                  {activePageContextCards.length ? (
                    <div className="developer-portal-page-context-grid">
                      {activePageContextCards.map((card) => (
                        <div key={`${currentPageKey}-${card.label}`} className="developer-portal-page-context-card">
                          <span className="mono-label">{card.label}</span>
                          <strong>{card.value}</strong>
                          <p>{card.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {activeWorkbenchPanels.length ? (
                    <div className="developer-portal-workbench-grid">
                      {activeWorkbenchPanels.map((panel) => (
                        <section key={`${currentPageKey}-${panel.title}`} className="developer-portal-workbench-card">
                          <div className="section-stack section-stack-tight">
                            <span className="mono-label">{panel.eyebrow}</span>
                            <strong>{panel.title}</strong>
                          </div>
                          <div className="developer-portal-workbench-list">
                            {panel.items.map((item) =>
                              item.href ? (
                                <Link key={item.label} className="developer-portal-list-link" href={item.href}>
                                  <strong>{item.label}</strong>
                                  <span>{item.detail}</span>
                                </Link>
                              ) : (
                                <div key={item.label} className="developer-portal-list-row">
                                  <span className="developer-portal-step-index">•</span>
                                  <span>
                                    <strong>{item.label}</strong>
                                    <br />
                                    {item.detail}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : null}

                  <div className="docs-experience-inline-cards">
                    {currentPage.sections.slice(0, 4).map((section) => (
                      <div key={section.id} className="docs-experience-inline-card">
                        <span className="mono-label">{section.title}</span>
                        <strong>{section.body[0]}</strong>
                        <p>{section.body[1] ?? section.body[0]}</p>
                      </div>
                    ))}
                  </div>

                  {currentPage.codeSample ? (
                    <div className="docs-code-card">
                      <div className="docs-code-head">
                        <div className="docs-code-title">
                          <span className="mono-label">{currentPage.codeSample.language}</span>
                          <strong>{currentPage.codeSample.title}</strong>
                        </div>
                      </div>
                      <pre className="docs-code-block">
                        <code>{currentPage.codeSample.code}</code>
                      </pre>
                      {currentPage.codeSample.note ? <p className="detail-text">{currentPage.codeSample.note}</p> : null}
                    </div>
                  ) : null}

                  {activeFocusPanels.length ? (
                    <div className="developer-portal-dashboard-grid">
                      {activeFocusPanels.map((panel) => (
                        <div key={`${currentPageKey}-${panel.title}`} className="developer-portal-dashboard-card">
                          <div className="developer-portal-dashboard-head">
                            <strong>{panel.title}</strong>
                            <span className="mono-label">{panel.eyebrow}</span>
                          </div>
                          <div className="developer-portal-list">
                            {panel.rows.map((row) => (
                              <div key={row.label} className="developer-portal-list-row">
                                <span className="developer-portal-step-index">•</span>
                                <span>
                                  <strong>
                                    {row.label}: {row.value}
                                  </strong>
                                  <br />
                                  {row.detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {activeInsightPanels.length ? (
                    <div className="developer-portal-insight-grid">
                      {activeInsightPanels.map((panel) => (
                        <section key={`${currentPageKey}-${panel.title}`} className="developer-portal-insight-card">
                          <div className="section-stack section-stack-tight">
                            <span className="mono-label">{panel.eyebrow}</span>
                            <strong>{panel.title}</strong>
                          </div>

                          {panel.meters ? (
                            <div className="developer-portal-meter-list">
                              {panel.meters.map((meter) => (
                                <div key={meter.label} className="developer-portal-meter-row">
                                  <div className="developer-portal-meter-head">
                                    <span>{meter.label}</span>
                                    <strong>{meter.value}</strong>
                                  </div>
                                  <div aria-hidden="true" className="developer-portal-meter-track">
                                    <span className="developer-portal-meter-fill" style={{ width: `${meter.fill}%` }} />
                                  </div>
                                  <p>{meter.detail}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {panel.timeline ? (
                            <div className="developer-portal-timeline">
                              {panel.timeline.map((event) => (
                                <div
                                  key={`${event.time}-${event.label}`}
                                  className={`developer-portal-timeline-row${event.tone ? ` is-${event.tone}` : ""}`}
                                >
                                  <span className="developer-portal-timeline-time">{event.time}</span>
                                  <div className="developer-portal-timeline-content">
                                    <strong>{event.label}</strong>
                                    <p>{event.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  ) : null}

                  <div className="docs-experience-section-list">
                    {currentPage.sections.map((section) => (
                      <section key={section.id} className="docs-experience-section" id={section.id}>
                        <span className="mono-label">{section.title}</span>
                        <div className="section-stack section-stack-tight">
                          {section.body.map((paragraph) => (
                            <p key={paragraph} className="detail-text">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>

                {relatedPages.length ? (
                  <div className="docs-experience-results">
                    {relatedPages.map((page) => (
                      <Link
                        key={page.slug.join("/") || "overview"}
                        className="docs-experience-result"
                        href={getDeveloperPortalPath(page.slug, hostMode)}
                      >
                        <span className="mono-label">{page.group}</span>
                        <strong>{page.title}</strong>
                        <p>{page.summary}</p>
                      </Link>
                    ))}
                  </div>
                ) : null}

                <div className="docs-reading-map">
                  <div className="docs-reading-map-card">
                    <strong>Stand up the workspace.</strong>
                    <div className="docs-reading-map-links">
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["organizations"], hostMode)}>
                        <span>Organizations</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["projects"], hostMode)}>
                        <span>Projects</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["api-keys"], hostMode)}>
                        <span>API keys</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["playground"], hostMode)}>
                        <span>Playground</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="docs-reading-map-card">
                    <strong>Start with sandbox and setup.</strong>
                    <div className="docs-reading-map-links">
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["quickstarts"], hostMode)}>
                        <span>Quickstarts</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["sandbox-access"], hostMode)}>
                        <span>Sandbox access</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["production-review"], hostMode)}>
                        <span>Production review</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["reference"], hostMode)}>
                        <span>Reference</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="docs-reading-map-card">
                    <strong>Operate the enterprise workspace.</strong>
                    <div className="docs-reading-map-links">
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["platform-dashboard"], hostMode)}>
                        <span>Platform dashboard</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["pricing"], hostMode)}>
                        <span>Usage billing</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["customers"], hostMode)}>
                        <span>Customer portfolio</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["reports"], hostMode)}>
                        <span>Reports and exports</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                  <div className="docs-reading-map-card">
                    <strong>Keep integrations healthy.</strong>
                    <div className="docs-reading-map-links">
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["webhooks"], hostMode)}>
                        <span>Webhook delivery</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["troubleshooting"], hostMode)}>
                        <span>Troubleshooting</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["audit-logs"], hostMode)}>
                        <span>Audit logs</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link className="docs-reading-map-link" href={getDeveloperPortalPath(["strategic-partners"], hostMode)}>
                        <span>Strategic partners</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="docs-experience-ai">
                  <DocsAiAssistant access={galactusAccess} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
