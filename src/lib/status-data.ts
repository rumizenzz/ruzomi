export type StatusLevel = "operational" | "degraded" | "maintenance";

export interface StatusPoint {
  status: StatusLevel;
}

export interface StatusComponent {
  id: string;
  name: string;
  status: StatusLevel;
  summary: string;
  uptime90d: string;
  latestEvent: string;
  history: StatusPoint[];
}

export interface StatusGroup {
  id: string;
  title: string;
  summary: string;
  components: StatusComponent[];
}

export interface StatusIncidentUpdate {
  timestamp: string;
  title: string;
  body: string;
}

export interface StatusIncident {
  id: string;
  title: string;
  impact: "minor" | "major";
  state: "monitoring" | "resolved" | "scheduled";
  window: string;
  summary: string;
  components: string[];
  updates: StatusIncidentUpdate[];
}

export interface StatusSnapshot {
  generatedAt: string;
  overallStatus: StatusLevel;
  headline: string;
  summary: string;
  uptime90d: string;
  monitoredServices: number;
  activeSubscribers: string;
  nextMaintenance: string;
  groups: StatusGroup[];
  incidents: StatusIncident[];
}

function buildHistory(incidentIndexes: number[] = []): StatusPoint[] {
  return Array.from({ length: 30 }, (_, index) => ({
    status: incidentIndexes.includes(index) ? "degraded" : "operational",
  }));
}

const statusGroups: StatusGroup[] = [
  {
    id: "product",
    title: "Product Surfaces",
    summary: "Live commitment discovery, market detail, Ruzomi, and mobile continuation.",
    components: [
      {
        id: "commitment-board",
        name: "Commitment Board",
        status: "operational",
        summary: "Market discovery, category rail, and upcoming-market countdowns.",
        uptime90d: "99.99%",
        latestEvent: "No active incident",
        history: buildHistory([18]),
      },
      {
        id: "market-detail",
        name: "Market Detail",
        status: "operational",
        summary: "Join windows, proof timing, and real-time market analytics.",
        uptime90d: "99.97%",
        latestEvent: "No active incident",
        history: buildHistory([11]),
      },
      {
        id: "ruzomi",
        name: "Ruzomi & Spark",
        status: "operational",
        summary: "Channels, direct sparks, unread state, and result artifact share surfaces.",
        uptime90d: "99.95%",
        latestEvent: "No active incident",
        history: buildHistory([6, 7]),
      },
      {
        id: "mobile-continuation",
        name: "Mobile Continuation",
        status: "operational",
        summary: "Desktop-to-mobile proof handoff, QR routing, and continuation tokens.",
        uptime90d: "99.98%",
        latestEvent: "No active incident",
        history: buildHistory([13]),
      },
    ],
  },
  {
    id: "wallet",
    title: "Funding & Wallet",
    summary: "Deposits, payout routing, locked stakes, and settlement balance updates.",
    components: [
      {
        id: "wallet-funding",
        name: "Wallet Funding",
        status: "operational",
        summary: "Card, bank, and prefilled top-up flows with funding review breakdowns.",
        uptime90d: "99.96%",
        latestEvent: "No active incident",
        history: buildHistory([3]),
      },
      {
        id: "identity-verify",
        name: "Identity Verification",
        status: "operational",
        summary: "KYC detail capture, Stripe Identity routing, and onboarding verification.",
        uptime90d: "99.94%",
        latestEvent: "No active incident",
        history: buildHistory([9, 10]),
      },
      {
        id: "payouts",
        name: "Withdrawals & Payouts",
        status: "maintenance",
        summary: "Instant payout review, verification-code release, and settlement transfer reporting.",
        uptime90d: "99.89%",
        latestEvent: "Scheduled maintenance tonight at 2:00 AM ET",
        history: buildHistory([0, 1, 2]),
      },
    ],
  },
  {
    id: "ai",
    title: "Galactus & Intelligence",
    summary: "GPT-5.4 runtime, docs/help responses, support threads, and video-analysis sidecar.",
    components: [
      {
        id: "galactus-runtime",
        name: "Galactus Runtime",
        status: "operational",
        summary: "Plan mode, execution mode, tool routing, and GPT-5.4 interactive turns.",
        uptime90d: "99.98%",
        latestEvent: "No active incident",
        history: buildHistory([21]),
      },
      {
        id: "docs-help",
        name: "Docs & Help",
        status: "operational",
        summary: "Docs host, help center, FAQ, and support availability surfaces.",
        uptime90d: "99.99%",
        latestEvent: "No active incident",
        history: buildHistory(),
      },
      {
        id: "video-analysis",
        name: "Video Understanding",
        status: "operational",
        summary: "Uploaded-video analysis and derived context handoff for proof review.",
        uptime90d: "99.93%",
        latestEvent: "No active incident",
        history: buildHistory([16, 17]),
      },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise & Developer",
    summary: "HRS API, enterprise dashboards, developer portal, and webhook delivery.",
    components: [
      {
        id: "hrs-api",
        name: "HRS API",
        status: "operational",
        summary: "Consent-scoped reliability lookups, usage metering, and tenant isolation.",
        uptime90d: "99.97%",
        latestEvent: "No active incident",
        history: buildHistory([20]),
      },
      {
        id: "enterprise-dashboard",
        name: "Enterprise Dashboard",
        status: "operational",
        summary: "Portfolio overview, customer drill-down, billing usage, and export jobs.",
        uptime90d: "99.96%",
        latestEvent: "No active incident",
        history: buildHistory([8]),
      },
      {
        id: "developer-platform",
        name: "Developer Platform",
        status: "operational",
        summary: "Reference docs, quickstarts, webhooks, and integration guides.",
        uptime90d: "99.99%",
        latestEvent: "No active incident",
        history: buildHistory(),
      },
    ],
  },
];

const statusIncidents: StatusIncident[] = [
  {
    id: "maintenance-20260312-wallet",
    title: "Scheduled payout rail maintenance",
    impact: "minor",
    state: "scheduled",
    window: "Mar 12, 2026 · 2:00 AM to 2:20 AM ET",
    summary:
      "Instant payout release will pause briefly while debit-card transfer checks and notification delivery are rotated.",
    components: ["Withdrawals & Payouts", "Wallet Funding"],
    updates: [
      {
        timestamp: "Mar 12, 2026 · 2:00 AM ET",
        title: "Maintenance window begins",
        body: "New withdrawal releases pause while the payout rail rotates to the new verification-code release window.",
      },
      {
        timestamp: "Mar 12, 2026 · 2:20 AM ET",
        title: "Expected completion",
        body: "Once complete, payout release and funding balance refresh return to normal with no stake data loss expected.",
      },
    ],
  },
  {
    id: "incident-20260309-ruzomi",
    title: "Ruzomi unread counters delayed",
    impact: "minor",
    state: "resolved",
    window: "Resolved Mar 9, 2026 · 4:38 PM ET",
    summary:
      "Unread counts and channel badges lagged behind new messages for a short period while realtime fan-out recovered.",
    components: ["Ruzomi & Spark"],
    updates: [
      {
        timestamp: "Mar 9, 2026 · 3:46 PM ET",
        title: "Investigating delayed badge updates",
        body: "Unread and mention counters were updating late even though new messages and replies were posting normally.",
      },
      {
        timestamp: "Mar 9, 2026 · 4:11 PM ET",
        title: "Fix deployed",
        body: "Realtime fan-out was rebalanced and unread counters began catching up across active channels.",
      },
      {
        timestamp: "Mar 9, 2026 · 4:38 PM ET",
        title: "Resolved",
        body: "Unread counters, direct sparks, and reply badges are current again across web and mobile surfaces.",
      },
    ],
  },
  {
    id: "incident-20260304-docs",
    title: "Docs host search indexing lag",
    impact: "minor",
    state: "resolved",
    window: "Resolved Mar 4, 2026 · 11:02 AM ET",
    summary:
      "Docs search results were stale for recently published pages while the knowledge-base index rehydrated.",
    components: ["Docs & Help", "Developer Platform"],
    updates: [
      {
        timestamp: "Mar 4, 2026 · 9:48 AM ET",
        title: "Investigating stale search results",
        body: "Search was serving older knowledge-base entries and missing newly published guide pages.",
      },
      {
        timestamp: "Mar 4, 2026 · 11:02 AM ET",
        title: "Resolved",
        body: "The index was rebuilt and search results now reflect current docs, help, and developer content.",
      },
    ],
  },
];

export function getStatusSnapshot(): StatusSnapshot {
  const monitoredServices = statusGroups.reduce((count, group) => count + group.components.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: "operational",
    headline: "All systems operational",
    summary:
      "Commitment markets, Galactus, funding, enterprise reporting, and Ruzomi are available. One minor payout maintenance window is scheduled tonight.",
    uptime90d: "99.97%",
    monitoredServices,
    activeSubscribers: "6.4k",
    nextMaintenance: "Tonight · 2:00 AM ET",
    groups: statusGroups,
    incidents: statusIncidents,
  };
}
