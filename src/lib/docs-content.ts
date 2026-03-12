import type { DocPage, DocsSearchResult } from "@/lib/types";

export const docsPages: DocPage[] = [
  {
    slug: [],
    group: "Overview",
    title: "PayToCommit Documentation",
    eyebrow: "Docs",
    summary:
      "Product rules, setup guides, identity, funding, APIs, consent, and enterprise reference for PayToCommit.",
    searchTerms: ["overview", "docs", "protocol", "funding", "identity", "api"],
    sections: [
      {
        id: "platform",
        title: "Platform surfaces",
        body: [
          "PayToCommit runs across four main surfaces: Commitment Markets, My Portfolio, Spark, and the Commitment Network. Commitment Markets shows what is open. My Portfolio shows what you have funded and joined. Spark shows what is happening around a market. The Commitment Network records what is already posted.",
          "Commitment Markets are completion-based. Entrants join on themselves, work toward the same ruleset, and resolve completed or missed against the published deadline and proof window.",
          "Chains link two related commitment markets into one combined position. Both linked commitments must resolve completed for the Chain to finish clean.",
        ],
      },
      {
        id: "public-access",
        title: "Public access",
        body: [
          "Docs search and docs content are public. Commitment Markets are also open for guest reading, including full market pages, Fractal Market detail, and live pulse graphs before sign-in.",
          "Protected actions, protected reliability lookups, and direct AI account tools stay scoped to the identity, consent, and eligibility rules that govern them.",
          "Documentation explains what the platform does, what each protected scope allows, and how funding, proofs, disputes, and consent work. It does not expose protected customer records or unrestricted reliability history.",
        ],
      },
      {
        id: "what-unlocks-when",
        title: "What unlocks when",
        body: [
          "Public docs, public search, and public market discovery are open without sign-in. Guests can browse and read first. The account capture wall appears only when a protected action such as staking or direct Galactus access begins.",
          "Funding, payouts, market generation, Docs AI, and direct Galactus conversations unlock only after the account clears the required identity and activity rules.",
          "Search stays open for everyone. Generate, Ask Galactus, and other protected AI paths unlock only after one verified completed commitment inside the active 30-day window.",
        ],
      },
    ],
  },
  {
    slug: ["biological-signature-protocol"],
    group: "Core Protocols",
    title: "Biological Signature Protocol",
    eyebrow: "Protocol",
    summary:
      "How PayToCommit anchors identity and proof integrity for markets that require stronger trust checks.",
    searchTerms: ["biological signature", "protocol", "proof integrity", "hardware truth", "stp"],
    sections: [
      {
        id: "identity-anchor",
        title: "Identity anchor",
        body: [
          "Biological Signature Protocol starts from verified identity. Stripe Identity anchors the legal user, then PayToCommit uses that verified account to control protected funding and higher-trust proof flows.",
          "Markets that only need standard web proof can stay inside the browser. Markets that require stronger proof capture can route into native capture for supported devices.",
        ],
      },
      {
        id: "proof-capture",
        title: "Proof capture modes",
        body: [
          "Proof capture can run in standard web mode or native-first high-trust mode. Native-first capture is used when the ruleset requires stronger timing, challenge-response, or device-backed evidence.",
          "High-trust capture can include timed prompts, controlled capture windows, and device-backed evidence checks before the proof is accepted into verification.",
        ],
      },
    ],
  },
  {
    slug: ["identity-consent"],
    group: "Core Protocols",
    title: "Identity & Consent",
    eyebrow: "Identity",
    summary:
      "How identity verification, consent scopes, protected lookups, and audited access work across the platform.",
    searchTerms: ["identity", "consent", "scope", "reliability access", "protected lookup"],
    sections: [
      {
        id: "identity",
        title: "Identity verification",
        body: [
          "Funding, payout access, and higher-trust proof flows require verified identity. The account holder submits legal identity details, then completes Stripe Identity capture for government ID and any required selfie checks.",
          "Identity state moves through not started, pending, verified, or failed. Funding stays locked until the account is verified.",
        ],
      },
      {
        id: "consent",
        title: "Consent scopes",
        body: [
          "Protected reliability access is consent-gated. There is no open legal-name lookup, no unrestricted public reliability search, and no broad scraping access for protected records.",
          "When a user grants the identity scope, an approved enterprise integration can match the protected reliability record to that user's legal identity for the declared purpose. Every consent grant is scoped, logged, and attributable to an app, an account, a purpose, and a timestamp. Users can review granted scopes and revoke them where applicable.",
          "Consent does not add artificial points to a score. It makes a verified record portable to approved organizations that need to review real reliability history for real decisions such as approvals, underwriting, hiring, partner review, or trust-sensitive access.",
        ],
      },
    ],
  },
  {
    slug: ["commitment-markets"],
    group: "Product Surfaces",
    title: "Commitment Markets",
    eyebrow: "Markets",
    summary:
      "How markets open, what each market contains, how proof windows work, and how nested market groups are structured.",
    searchTerms: ["commitment markets", "markets", "fractal markets", "nested", "rules"],
    sections: [
      {
        id: "market-model",
        title: "Market model",
        body: [
          "Every Commitment Market defines a target, join window, close time, proof window, dispute window, and payout rule before it opens. Entrants join on themselves and resolve against the same published rules.",
          "Very new markets can keep their pooled total hidden until the published reveal threshold is met. Activity and momentum can still appear before a full total is shown.",
        ],
      },
      {
        id: "nested-groups",
        title: "Nested and grouped markets",
        body: [
          "A parent market can contain grouped sub-markets when the commitment space needs multiple concrete variants. This keeps related commitments together while still letting each market have its own target, deadline, and proof rule.",
          "Grouped markets are meant to improve scanning and discovery. They do not change the requirement that each live market must be tangible enough to verify.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base"],
    group: "Knowledge Base",
    title: "Knowledge Base",
    eyebrow: "Knowledge Base",
    summary:
      "Step-by-step guides for funding, commitment flow, proof timing, social activity, and enterprise setup.",
    searchTerms: [
      "knowledge base",
      "guide",
      "getting started",
      "market lifecycle",
      "proof timing",
      "enterprise setup",
    ],
    sections: [
      {
        id: "coverage",
        title: "What the knowledge base covers",
        body: [
          "The knowledge base explains the practical side of the platform in the same order people use it: account setup, identity, funding, joining, proof, results, social sharing, and enterprise access.",
          "Each guide is written to answer one job clearly. Use it when you need the next step, a product rule, or the reason a protected feature is still locked.",
        ],
      },
      {
        id: "public-and-protected",
        title: "Public reading and protected actions",
        body: [
          "Knowledge-base articles and search stay public. Protected actions such as Ask Galactus, direct support AI, market generation, and the direct enterprise sales conversation stay locked until the account has one verified completed commitment inside the active 30-day window.",
          "Public help and enterprise intake still stay reachable before that direct Galactus window opens.",
          "If a protected action is locked, the platform returns a direct explanation and the next step required to restore access.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "getting-started"],
    group: "Knowledge Base",
    title: "Getting Started",
    eyebrow: "Knowledge Base",
    summary:
      "The first five steps: confirm email, pick a commitment, add your first funds when you are ready, finish one commitment, and unlock the active Galactus window.",
    searchTerms: [
      "getting started",
      "first deposit",
      "first 10 dollars",
      "unlock galactus",
      "quickstart",
      "first commitment",
    ],
    sections: [
      {
        id: "first-five",
        title: "The first five steps",
        body: [
          "Start by confirming your email. After that, pick a commitment you want to finish, then add your first $10 when you are ready to fund or stake.",
          "Identity does not block account creation. Verification opens only when you move into funding or a live stake, then the market continues once that check is complete.",
          "Once that verified finish lands, the account unlocks Generate, Docs AI, and direct Galactus support and sales conversations for the active 30-day window.",
        ],
      },
      {
        id: "compact-quickstart",
        title: "Compact quickstart on the board",
        body: [
          "The compact quickstart card appears only for signed-in accounts with confirmed email. It stays small on purpose so it helps without taking over the board or the profile settings route.",
          "The card always shows the next step, the current Galactus window, and the direct route to continue.",
          "The first funding step is explicit there on purpose: add your first $10 when you are ready to fund or stake, not during account creation.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "market-lifecycle"],
    group: "Knowledge Base",
    title: "Commitment Market Lifecycle",
    eyebrow: "Knowledge Base",
    summary:
      "How a market opens, when pool totals stay hidden, how proof windows close, and when Early Release or Cashout appear.",
    searchTerms: [
      "market lifecycle",
      "hidden totals",
      "reveal threshold",
      "early release",
      "cashout",
      "proof window",
    ],
    sections: [
      {
        id: "hidden-totals",
        title: "Hidden totals and the reveal threshold",
        body: [
          "New markets do not have to show a public pooled total immediately. The published reveal policy keeps totals hidden until the threshold is met so the opening phase stays readable while the first entries arrive.",
          "Before the threshold is reached, the market can still show activity pulses, proof requirements, timing, and commitment velocity.",
        ],
      },
      {
        id: "release-and-cashout",
        title: "Early Release and Cashout",
        body: [
          "Early Release is available before the deadline and returns 95% of the original stake after the published 5% forfeiture. The user sees that result clearly before confirming.",
          "Cashout appears only after a successful resolved result posts and the available payout has moved into wallet cash.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "first-deposit-and-first-stake"],
    group: "Knowledge Base",
    title: "First Deposit and First Stake",
    eyebrow: "Knowledge Base",
    summary:
      "What changes when you move from browsing into funding, how the first $10 works, and why identity starts only when money or a live stake is involved.",
    searchTerms: [
      "first deposit",
      "first stake",
      "first 10 dollars",
      "identity starts",
      "wallet funding",
      "join first market",
    ],
    sections: [
      {
        id: "when-identity-starts",
        title: "When identity starts",
        body: [
          "Opening an account does not require identity verification. Identity starts only when you move into funding or attempt to place a live stake in a commitment market.",
          "That keeps account creation light while still protecting wallet cash, payouts, and proof-linked settlements behind verified identity.",
        ],
      },
      {
        id: "first-ten-dollars",
        title: "The first $10 path",
        body: [
          "The first funding step is designed around a clear $10 starting path. Add your first $10 when you are ready to join a live commitment and make the first stake under the published rules.",
          "Quickstart keeps that step visible on purpose so the first funding decision feels direct, not hidden inside the wallet after too many clicks.",
          "That is also why signup stays light. The account opens first, then identity and funding begin only when money or a live stake enters the flow.",
        ],
      },
      {
        id: "after-first-stake",
        title: "What unlocks after the first verified finish",
        body: [
          "One live stake does not unlock every protected feature on its own. Generate, Docs AI, Support, and Sales unlock only after the account completes one verified commitment inside the active 30-day window.",
          "That rule keeps Galactus tied to proven participation instead of passive browsing alone.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "guest-browsing-and-stake-capture"],
    group: "Knowledge Base",
    title: "Guest Browsing and Stake Capture",
    eyebrow: "Knowledge Base",
    summary:
      "How guests can browse first, when the friction-light account wall appears, and how the stake session stays attached before funding or mobile proof continue.",
    searchTerms: [
      "guest browsing",
      "stake capture",
      "friction light auth",
      "stake without login",
      "impulse stake",
      "guest read access",
    ],
    sections: [
      {
        id: "read-first",
        title: "Read first, account later",
        body: [
          "Guests can read Commitment Markets, open full market pages, move through Fractal Markets, and inspect pulse graphs before they create an account.",
          "The account wall appears only when the guest tries to lock a live stake, save another protected action, or open a direct Galactus conversation.",
        ],
      },
      {
        id: "capture-the-intent",
        title: "Capture the account and the market intent together",
        body: [
          "When a live stake starts, PayToCommit opens the friction-light account capture flow instead of throwing a full login wall over discovery. That keeps the exact market, amount, and next step attached to the same session.",
          "Identity still does not start at account creation. It begins only when the user continues into funding or a protected live stake path.",
        ],
      },
      {
        id: "desktop-to-mobile",
        title: "Desktop-to-mobile handoff",
        body: [
          "If the market requires mobile proof, the desktop flow can stop after the stake locks and hand the session into the mobile app with a smart link or QR code.",
          "That handoff makes one thing clear: the funds are already staked and the next proof step continues on mobile without losing the same market context.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "proof-deadlines-and-results"],
    group: "Knowledge Base",
    title: "Proof, Deadlines, and Results",
    eyebrow: "Knowledge Base",
    summary:
      "How desktop and mobile divide work, what happens in the final countdown, and how completed or missed artifacts appear after resolution.",
    searchTerms: [
      "proof deadline",
      "mobile proof",
      "desktop proof",
      "result artifact",
      "deadline countdown",
      "missed result",
    ],
    sections: [
      {
        id: "desktop-mobile-split",
        title: "Desktop and mobile split",
        body: [
          "Desktop is for browsing, funding, joining, reviewing markets, and managing positions. STP-sensitive proof submission is routed through the mobile app so device-backed capture can run the right timing and evidence checks.",
          "Markets that accept standard browser proof can still use web capture when their rules allow it.",
        ],
      },
      {
        id: "desktop-handoff",
        title: "Desktop handoff after a live stake",
        body: [
          "When a market needs mobile proof, the desktop flow can stop after the stake locks and show a handoff state instead. That handoff makes it explicit that the funds are already staked and proof continues on mobile.",
          "The handoff includes the same market context, the stake amount, and a direct smart link or QR path so the user can continue on the phone without re-explaining the intent.",
        ],
      },
      {
        id: "result-artifacts",
        title: "Completed and missed artifacts",
        body: [
          "After a resolved result posts, the account can receive either a completed artifact or a missed-result artifact. If the user was offline when the result closed, that artifact can appear on the next login.",
          "Artifacts are built for download, internal sharing, and external sharing without exposing private proof files by default.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "desktop-proof-and-mobile-capture"],
    group: "Knowledge Base",
    title: "Desktop Review and Mobile Proof Capture",
    eyebrow: "Knowledge Base",
    summary:
      "Why desktop stays open for discovery and staking while some markets require the mobile app for final proof capture.",
    searchTerms: [
      "desktop review",
      "mobile proof",
      "native capture",
      "stp mobile",
      "desktop stake mobile proof",
    ],
    sections: [
      {
        id: "desktop-role",
        title: "What desktop is for",
        body: [
          "Desktop is the main place for discovery, funding, staking, position review, and market research. The board, grouped markets, and portfolio are all built to work there cleanly.",
          "That means you can decide, fund, and join from desktop without being forced into a phone first.",
        ],
      },
      {
        id: "mobile-role",
        title: "What mobile is for",
        body: [
          "Some markets require STP-sensitive proof capture. Those markets use the mobile app because the device can run the required timing, challenge-response, and higher-trust capture checks.",
          "If a market requires mobile proof, the rules make that clear before you commit so the submission path is never a surprise after money is at risk.",
        ],
      },
      {
        id: "stake-first-auth-later",
        title: "Guest discovery and the first protected step",
        body: [
          "Guests can read first. They can browse categories, open markets, and inspect Fractal Market detail before creating an account.",
          "The friction-light account capture appears only when the user tries to lock a live stake or open another protected action. That keeps discovery open while still capturing the account and the live intent before funding or mobile proof continue.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "referrals-and-contact-sync"],
    group: "Knowledge Base",
    title: "Referrals, Contact Sync, and Invite Rewards",
    eyebrow: "Knowledge Base",
    summary:
      "How the referral checklist works, when invite rewards unlock, and how optional contact sync helps send direct invites from mobile.",
    searchTerms: [
      "referrals",
      "contact sync",
      "invite reward",
      "invite countdown",
      "friend invite",
      "sync contacts",
    ],
    sections: [
      {
        id: "reward-rule",
        title: "The reward rule",
        body: [
          "Invite rewards unlock only after the invited user signs up, funds the wallet, places the first live stake, and completes that first verified commitment.",
          "When that verified result posts, $10 can release to the invited user and $10 can release to the referrer. The reward does not post earlier than that final verified finish.",
        ],
      },
      {
        id: "tracker-and-countdown",
        title: "Tracker and countdown",
        body: [
          "The referral tracker shows the same checklist for both accounts so every required step is visible in order. The product can also show the remaining invite window and send reminder prompts before the bonus expires.",
          "That keeps the reward path legible instead of leaving the referrer to guess whether funding, staking, proof, or final verification is still missing.",
        ],
      },
      {
        id: "contact-sync",
        title: "Optional contact sync",
        body: [
          "Contact sync is optional and mobile-first. The app asks for permission before reading contacts, then shows who is already on the platform and who can receive a direct invite.",
          "You can still use the referral path without syncing contacts. Contact access is there to speed up direct invites, not to gate the rest of the product.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "legal-name-consent-and-enterprise-review"],
    group: "Knowledge Base",
    title: "Legal-Name Consent and Enterprise Review",
    eyebrow: "Knowledge Base",
    summary:
      "How consent-backed legal-name matching works, why approved organizations ask for it, and what stays locked without that scope.",
    searchTerms: [
      "legal-name consent",
      "enterprise review",
      "identity scope",
      "protected matching",
      "human reliability api legal name",
    ],
    sections: [
      {
        id: "approved-scope",
        title: "Approved identity scope",
        body: [
          "An approved organization can review the consenting person's protected Human Reliability record under that person's legal identity only when the identity scope is granted for that exact use case.",
          "Without that scope, the protected record stays disconnected from legal-name-backed matching even if the organization already has another approved key.",
        ],
      },
      {
        id: "what-consent-does-not-do",
        title: "What consent does not do",
        body: [
          "Consent does not inflate the score, manufacture points, or create synthetic history. The score still comes only from verified commitment history and the live HRS trend attached to that record.",
          "What consent does is make the earned record portable to that approved organization when the user wants it considered for a real opportunity or review.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "ruzomi-and-spark"],
    group: "Knowledge Base",
    title: "Ruzomi and Spark",
    eyebrow: "Knowledge Base",
    summary:
      "How the standalone network and the in-market feed work together, what guests can read, and when posting, reacting, and direct Sparks unlock.",
    searchTerms: [
      "ruzomi",
      "spark",
      "social network",
      "guest spark",
      "reactions",
      "direct sparks",
    ],
    sections: [
      {
        id: "network-split",
        title: "Ruzomi and Spark",
        body: [
          "Ruzomi is the broader network experience. Spark is the messaging and feed layer that appears inside joined markets and across that network.",
          "Joined commitment markets become the active channels on the left rail, which replaces generic server lists with the markets the user actually joined.",
        ],
      },
      {
        id: "posting-rules",
        title: "Guest and account rules",
        body: [
          "Guests can read public activity. Posting, reacting, replying, polls, direct Sparks, and Galactus conversations require a signed-in account that meets the published access rule.",
          "If the account does not qualify for Galactus access, the product responds with a direct explanation and the exact step needed to unlock it again.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "victory-and-forfeiture-artifacts"],
    group: "Knowledge Base",
    title: "Victory and Forfeiture Artifacts",
    eyebrow: "Knowledge Base",
    summary:
      "How result artifacts appear, what they show, how they save, and how completed or missed outcomes move into Spark and Ruzomi.",
    searchTerms: [
      "victory artifact",
      "forfeiture artifact",
      "save artifact",
      "share to spark",
      "result card",
    ],
    sections: [
      {
        id: "artifact-appearance",
        title: "When artifacts appear",
        body: [
          "Result artifacts can appear as soon as a market resolves or on the next login if the user was offline when the result posted. A completed market produces a completed artifact. A missed result produces a forfeiture artifact.",
          "The reveal is meant to feel final and clear: proof checked, result posted, and the outcome ready to save or share.",
        ],
      },
      {
        id: "artifact-actions",
        title: "Save and share",
        body: [
          "Artifacts support Save Artifact, Share to Spark, and external sharing. Save Artifact creates a branded image asset without exposing private proof files by default.",
          "Spark sharing posts the result directly into the account's social history and the broader network path when the user chooses to share it.",
        ],
      },
      {
        id: "artifact-surface",
        title: "What the artifact shows",
        body: [
          "A completed artifact highlights the final proof seal, the finished market path, and the stake-to-payout outcome. A forfeiture artifact shows the missed requirement, the forfeited amount, and the result impact with the same level of clarity.",
          "Both are meant to read like durable proof of the final outcome rather than casual social stickers.",
        ],
      },
    ],
  },
  {
    slug: ["knowledge-base", "enterprise-reliability"],
    group: "Knowledge Base",
    title: "Enterprise Reliability Setup",
    eyebrow: "Knowledge Base",
    summary:
      "How enterprise teams request Human Reliability API access, how consent works, and what usage billing covers once the application is approved.",
    searchTerms: [
      "enterprise reliability",
      "hrs setup",
      "enterprise api",
      "consent scope",
      "usage billing",
      "sales",
    ],
    sections: [
      {
        id: "application-flow",
        title: "Application flow",
        body: [
          "Enterprise access starts with the same verified-completion rule that unlocks other Galactus features. After that, the organization submits its use case, contact details, billing expectations, and consent model.",
          "Galactus reviews the application against the declared use case, the requested scope, and the billing path needed for that integration.",
        ],
      },
      {
        id: "scope-and-billing",
        title: "Consent scope and billing",
        body: [
          "Human Reliability API access is consent-scoped, auditable, and billed by protected usage. It is not an open legal-name lookup or an unrestricted people search tool.",
          "When identity scope is granted, the protected response can be tied to the consenting person's legal identity and live HRS history for the approved use case. Approved teams receive scoped keys, usage visibility, and documentation for secure integration and audit review.",
          "That consent can open more opportunities because approved teams can review a verified record instead of an empty file. The record still rises or falls only through completed or missed commitments, not through consent alone.",
        ],
      },
    ],
  },
  {
    slug: ["command-center-market-drafting"],
    group: "Product Surfaces",
    title: "Command Center and Market Drafting",
    eyebrow: "Command Center",
    summary:
      "How Search and Generate share one field, when Generate unlocks, and how the Galactus drafting thread builds a new market.",
    searchTerms: [
      "command center",
      "search generate",
      "market drafting",
      "generate unlock",
      "galactus thread",
      "plan mode",
    ],
    sections: [
      {
        id: "search-default",
        title: "Search is the default",
        body: [
          "Search is the default mode for guests, new users, and inactive users. This lets every visitor scan existing markets, live categories, and recent activity before they try to draft something new.",
          "When the account earns Generate access, the mode order changes and the board shows how much time remains before the active window expires again.",
        ],
      },
      {
        id: "draft-thread",
        title: "Galactus drafting thread",
        body: [
          "Market drafting runs as a guided thread. Galactus asks short clarifying questions, offers suggested answers, accepts custom answers that follow the rules, and expands the plan before a market can open.",
          "The user does not edit rule fields directly. The draft updates through the thread so dates, proof rules, category placement, and join windows stay coherent.",
        ],
      },
      {
        id: "open-later",
        title: "Open now or open later",
        body: [
          "Drafts save immediately. A finished draft can open right away or stay saved for later review.",
          "If dates or join windows would be stale by the time a saved draft returns, Galactus refreshes them before the market can open.",
        ],
      },
    ],
  },
  {
    slug: ["chains"],
    group: "Product Surfaces",
    title: "Chains",
    eyebrow: "Chains",
    summary:
      "Two linked commitment markets that settle together only when both legs resolve completed.",
    searchTerms: ["chains", "linked commitments", "two-leg", "settlement"],
    sections: [
      {
        id: "construction",
        title: "Construction",
        body: [
          "A Chain links exactly two compatible commitment markets. The builder explains both legs, both deadlines, both proof modes, and the all-or-nothing result rule before a user funds it.",
          "Chains are intended for related behavior loops, not for unrelated commitments glued together for novelty.",
        ],
      },
      {
        id: "settlement",
        title: "Settlement",
        body: [
          "Both legs must resolve completed for the Chain to close clean. If either leg misses, the Chain closes missed.",
          "Chain payouts remain fully funded. No synthetic payout is created outside the funded Chain participant pool and its forfeitures.",
        ],
      },
    ],
  },
  {
    slug: ["enterprise-services"],
    group: "Enterprise",
    title: "Enterprise Services",
    eyebrow: "Enterprise",
    summary:
      "Consent-scoped integrations, audit-ready logs, usage billing, and deployment patterns for enterprise teams.",
    searchTerms: ["enterprise", "billing", "integrations", "audit", "usage"],
    sections: [
      {
        id: "integrations",
        title: "Integration model",
        body: [
          "Enterprise access is designed for banks, platforms, employers, underwriting teams, and operations teams that need consent-scoped reliability signals. Integrations are billed by usage and backed by auditable access logs.",
          "Each key is scoped to an app name, declared purpose, and access policy. Protected endpoints can return consent-backed legal-identity matching only when that scope is granted, and they must never be used without a matching consent grant.",
          "Approved organizations can use that identity-backed scope to review a real, earned reliability record under the consenting person's legal identity when a decision depends on verified follow-through instead of an empty trust file.",
        ],
      },
      {
        id: "billing",
        title: "Usage billing",
        body: [
          "Enterprise billing is usage-based. Charges follow actual protected requests, scoped feature usage, and the retained audit coverage attached to those requests.",
          "Usage billing is separate from consumer funding fees and settlement capture. Enterprise usage does not grant open access to protected personal records.",
        ],
      },
      {
        id: "dashboard-review",
        title: "Enterprise dashboard review",
        body: [
          "Approved teams can review current HRS standing alongside live trend history, including rises, plateaus, recoveries, and the most recent verified changes tied to the granted scope.",
          "Dashboard review is still governed by consent. Protected identity-backed views are available only when the user has granted the identity scope to that named integration.",
        ],
      },
    ],
  },
  {
    slug: ["developer-platform"],
    group: "Enterprise",
    title: "Developer Portal and Platform Workspace",
    eyebrow: "Enterprise",
    summary:
      "How public developer docs, the signed-in platform workspace, projects, keys, customer drill-down, and reports fit together.",
    searchTerms: [
      "developer portal",
      "platform workspace",
      "developers paytocommit",
      "platform paytocommit",
      "projects and keys",
      "customer drill-down",
    ],
    sections: [
      {
        id: "two-surfaces",
        title: "Two connected surfaces",
        body: [
          "developers.paytocommit.com is the public developer hub. It covers quickstarts, reference, webhook guides, pricing, troubleshooting, sandbox access, production review, and strategic partner guidance before the team signs in.",
          "platform.paytocommit.com is the signed-in operating workspace. That is where organizations, projects, API keys, customer drill-down, reports, exports, billing, and audit history live after the account opens a workspace.",
        ],
      },
      {
        id: "what-the-workspace-controls",
        title: "What the workspace controls",
        body: [
          "The workspace keeps the real operating objects in one place: organizations, sandbox and production projects, named keys, webhook health, customer portfolios, reports, billing usage, and audit logs.",
          "That split is deliberate. Public docs stay easy to evaluate, while the live operational surface stays tied to the right account, project, and access policy.",
        ],
      },
      {
        id: "where-to-start",
        title: "Where to start",
        body: [
          "Start in the developer hub if you are still evaluating the Human Reliability API, reading the quickstart, or checking consent and billing rules. Move into the platform workspace once your team is ready to create the first organization, sandbox project, and server-side key.",
          "The sales and strategic partner path sits beside that normal rollout. Teams can choose the standard enterprise path or request a negotiated flagship package without changing the base developer workflow.",
        ],
      },
    ],
  },
  {
    slug: ["human-reliability-api"],
    group: "Enterprise",
    title: "Human Reliability API",
    eyebrow: "API",
    summary:
      "Consent-scoped reliability access for protected integrations that need a user-authorized reliability signal.",
    searchTerms: ["human reliability api", "reliability api", "consent", "enterprise api", "human reliability score"],
    codeSample: {
      title: "Protected lookup",
      language: "ts",
      code: `export async function getReliabilitySignal(consentToken: string) {\n  const response = await fetch(\"https://api.paytocommit.com/v1/reliability\", {\n    method: \"POST\",\n    headers: {\n      Authorization: \"Bearer <enterprise_api_key>\",\n      \"Content-Type\": \"application/json\",\n    },\n    body: JSON.stringify({\n      consentToken,\n      scopes: [\"hrs.current\", \"hrs.trend\", \"identity.match\"],\n    }),\n  });\n\n  return response.json();\n}`,
      note:
        "Protected access requires a scoped enterprise key and an active user consent token. Identity-backed matching is available only when that scope is granted. The endpoint does not support open legal-name lookup.",
    },
    sections: [
      {
        id: "consent-required",
        title: "Consent required",
        body: [
          "Every protected reliability lookup requires explicit user consent. PayToCommit does not allow open legal-name lookup, unrestricted public reliability search, or broad historical scraping of protected user records.",
          "Consent is granted to a named integration, a declared purpose, and a defined scope. When identity scope is granted, the response can be tied to the consenting person's legal identity. Protected reliability access stays revocable and auditable.",
          "Users stay in control of whether that protected record can be used to unlock outside opportunities. Granting consent makes the verified record usable for that approved purpose, but it does not inflate the score itself.",
        ],
      },
      {
        id: "response-shape",
        title: "Response shape",
        body: [
          "The response returns a consent-scoped reliability signal, not a dump of a person's full platform history. The exact shape depends on the granted scope and the user's consent settings.",
          "Approved scopes can return current HRS, recent trend direction, plateau or recovery markers, and identity-backed matching when the user explicitly granted that identity scope. Protected responses are designed to work as a reliability input for enterprise systems while preserving user control and auditability.",
          "That lets approved teams review whether a consenting person has built a usable reliability record under their legal identity without turning the API into an unrestricted people-search surface.",
        ],
      },
      {
        id: "enterprise-history",
        title: "Live history and trend review",
        body: [
          "Enterprise dashboards can review the live HRS curve instead of a flat snapshot. That includes rises, plateaus, recoveries, and the latest verified events that changed the protected record.",
          "History visibility is still scope-bound. Integrations receive only the trend detail and event context covered by the granted consent.",
        ],
      },
      {
        id: "billing-and-audit",
        title: "Billing and audit",
        body: [
          "Enterprise usage is billed by protected request volume and audited access coverage. Each request is attributable to a key, a scope, a target account, and a timestamp.",
          "Keys are scoped, auditable, and revocable. Protected use outside the granted scope should be treated as a policy violation.",
        ],
      },
      {
        id: "who-uses-it",
        title: "Who uses it",
        body: [
          "The Human Reliability API is designed for banks, employers, underwriting teams, partner-review workflows, platforms, and smaller businesses that need the same consent-backed reliability signal for a real decision.",
          "That is why the API supports both protected legal-name-backed review and lighter consent-scoped reliability access. Galactus qualifies the right path based on the use case, request band, and granted scopes.",
        ],
      },
    ],
  },
  {
    slug: ["enterprise-dashboard"],
    group: "Enterprise",
    title: "Enterprise Dashboard and HRS History",
    eyebrow: "Enterprise",
    summary:
      "How enterprise teams review current HRS standing, protected history, consent scopes, and usage billing inside the organization account.",
    searchTerms: [
      "enterprise dashboard",
      "hrs history",
      "trend graph",
      "plateau",
      "recovery",
      "usage billing",
    ],
    sections: [
      {
        id: "history-view",
        title: "History view",
        body: [
          "The enterprise dashboard shows the protected HRS curve in one place. Teams can review rises, plateaus, recoveries, and the current standing tied to each consented record.",
          "History is updated from verified commitment activity and reflected in realtime once the protected event posts.",
        ],
      },
      {
        id: "identity-scope",
        title: "Identity-backed review",
        body: [
          "When the granted scope includes identity matching, the dashboard can connect the protected reliability record to the consenting person's legal identity for that approved integration.",
          "Without identity scope, the dashboard stays inside the remaining granted scopes and does not expose legal-name-backed matching.",
        ],
      },
      {
        id: "billing",
        title: "Usage and billing review",
        body: [
          "The same dashboard tracks request volume, request bands, audit history, and usage billing tied to the organization's API keys.",
          "Billing follows protected usage and approved scope, not idle seats or unused quota.",
        ],
      },
      {
        id: "decision-readiness",
        title: "Decision readiness",
        body: [
          "The enterprise dashboard is built for live decision support. Teams can review whether a consenting person has an established record, a fresh climb, a plateau, or a recovery pattern before a protected decision is made.",
          "That lets the organization use a live reliability record instead of treating the API like a flat score with no context behind it.",
        ],
      },
    ],
  },
  {
    slug: ["enterprise-legal-name-consent"],
    group: "Enterprise",
    title: "Legal-Name Consent and Opportunity Access",
    eyebrow: "Enterprise",
    summary:
      "How identity-backed matching works, why consent matters, and how approved organizations can use that scope for real decisions.",
    searchTerms: [
      "legal name",
      "identity match",
      "consent scope",
      "opportunity access",
      "human reliability consent",
    ],
    sections: [
      {
        id: "identity-match",
        title: "Identity-backed matching",
        body: [
          "Approved enterprise integrations can tie a protected reliability record to the consenting person's legal identity only when that identity scope is granted.",
          "Without that scope, the organization can review only the remaining granted reliability signal and cannot run legal-name-backed matching through the protected API.",
        ],
      },
      {
        id: "why-users-grant-consent",
        title: "Why users may grant consent",
        body: [
          "Consent allows a real reliability record to be used for approved opportunities instead of leaving that verified history invisible to outside decision makers. That can matter for applications, approvals, underwriting, or other trust-sensitive reviews.",
          "Consent does not manufacture a better score. It makes an earned record usable where the user wants it to matter under the user's legal identity and declared scope.",
        ],
      },
      {
        id: "control-and-revocation",
        title: "Control and revocation",
        body: [
          "Every consent grant is tied to a named integration, a declared purpose, and a logged time. Users can review that scope and, where allowed by policy and law, revoke access going forward.",
          "That makes the Human Reliability API portable and useful without turning it into an open directory of protected personal records.",
        ],
      },
      {
        id: "why-businesses-ask",
        title: "Why approved organizations ask for it",
        body: [
          "Organizations ask for identity-backed matching when a protected reliability record must be tied to the correct legal person before an approval, underwriting, hiring, partner, or eligibility decision can move forward.",
          "That is why identity scope is separate, explicit, and consent-bound. It makes the earned record usable for that approved decision without weakening the user's control over where the record can travel.",
        ],
      },
    ],
  },
  {
    slug: ["enterprise-usage-billing"],
    group: "Enterprise",
    title: "Enterprise Usage Billing and Request Bands",
    eyebrow: "Enterprise",
    summary:
      "How protected API usage is billed, what request bands mean, and how organizations estimate cost before they go live.",
    searchTerms: [
      "usage billing",
      "request bands",
      "enterprise pricing",
      "api billing",
      "protected requests",
    ],
    sections: [
      {
        id: "request-bands",
        title: "Request bands",
        body: [
          "The enterprise application asks for an expected request band so Galactus can qualify the right billing path and integration support level before protected access opens.",
          "Request bands are meant for forecasting. Final billing follows actual protected usage, not a guessed seat count or a static annual package alone.",
        ],
      },
      {
        id: "metered-usage",
        title: "Metered usage",
        body: [
          "Usage billing follows the number of protected requests, the scope of those requests, and the audit coverage attached to them. Protected usage is tracked per key and per organization account.",
          "That keeps the enterprise path fair for both high-volume organizations and smaller teams that still need the same consent-backed signal.",
        ],
      },
      {
        id: "pre-approval-review",
        title: "What is reviewed before approval",
        body: [
          "Before approval, Galactus reviews the declared use case, request band, legal-name matching requirement, workflow impact, and consent model so the right key scope and billing lane can be attached to the account.",
          "This is meant to keep the Human Reliability API useful for real business decisions without drifting into an unscoped people-search product.",
        ],
      },
      {
        id: "small-business-fit",
        title: "Enterprise and small-business fit",
        body: [
          "The same metered model works for larger enterprise teams and smaller businesses. Request bands are used to size onboarding and policy review, while final billing still follows actual protected traffic.",
          "That keeps access fair for a smaller team that needs a precise consent-backed lookup without forcing it into an enterprise package built for a much larger volume profile.",
        ],
      },
    ],
  },
  {
    slug: ["api"],
    group: "Reference",
    title: "API Reference",
    eyebrow: "Reference",
    summary:
      "Endpoints for market discovery, wallet state, Spark threads, funding, identity, and protected enterprise access.",
    searchTerms: ["api reference", "endpoints", "wallet", "spark", "identity", "markets"],
    codeSample: {
      title: "Market discovery",
      language: "http",
      code: `GET /api/pools?category=fitness&status=live\nAuthorization: Bearer <session_or_public_context>`,
      note: "Public discovery routes do not expose protected reliability records.",
    },
    sections: [
      {
        id: "markets",
        title: "Market endpoints",
        body: [
          "GET /api/pools returns the live Commitment Board feed with category, status, deadline, stake band, and related activity signals.",
          "GET /api/pools/[slug] returns the full market surface, including rule highlights, Commitment Network entries, Spark activity, and related Chains.",
        ],
      },
      {
        id: "wallet",
        title: "Wallet and funding endpoints",
        body: [
          "GET /api/wallet returns wallet balances, open positions, transactions, and notification state for the current session.",
          "POST /api/wallet/top-up creates the funding session for a verified account. Funding remains unavailable until identity is verified and the payment event is confirmed.",
        ],
      },
      {
        id: "identity",
        title: "Identity and verification endpoints",
        body: [
          "POST /api/profile/identity stores legal identity details needed for verification. POST /api/identity/session starts the Stripe Identity session that verifies government ID and any required selfie capture.",
          "Verification results update the account status and unlock the funding route once the platform records a verified outcome.",
        ],
      },
    ],
  },
  {
    slug: ["wallet-funding-payouts"],
    group: "Reference",
    title: "Wallet Funding and Payouts",
    eyebrow: "Wallet",
    summary:
      "How wallet funding, posted cash, holds, payout timing, and proof-linked settlement flows work across PayToCommit.",
    searchTerms: [
      "wallet",
      "funding",
      "payouts",
      "posted cash",
      "hold",
      "available balance",
      "add funds",
    ],
    sections: [
      {
        id: "wallet-states",
        title: "Wallet states",
        body: [
          "Wallet cash moves through pending, posted, held, and paid states. Only posted cash is spendable and withdrawable.",
          "Funding holds, open market holds, and unresolved settlement holds stay separate from posted wallet balance until they clear under the published rule.",
        ],
      },
      {
        id: "funding-methods",
        title: "Funding methods",
        body: [
          "Verified accounts can fund by Apple Pay, Google Pay, debit card, or ACH and wire where eligible. ACH and wire follow the published minimum and fee rules.",
          "Funding events must post successfully before wallet cash becomes available. Failed or reversed funding does not enter spendable wallet balance.",
        ],
      },
      {
        id: "mobile-proof-note",
        title: "Proof-linked settlement",
        body: [
          "Funding can begin on web or mobile, but STP-sensitive proof submission routes through the mobile app so the platform can run device-backed capture, timing, and challenge-response flows.",
          "Desktop remains available for browsing, joining, wallet review, and market management. Markets that require stronger proof capture stay unavailable for desktop proof submission.",
        ],
      },
      {
        id: "wallet-recovery-boundary",
        title: "Wallet recovery boundary",
        body: [
          "The Commitment Wallet follows its own continuity-key and device-access rules. Support can point you to wallet-access policy, but it cannot recover a lost 12-Word Continuity Key, reset a local wallet password, or bypass wallet-sensitive protections if recovery material is no longer available.",
          "PayToCommit will not ask you to send the 12-Word Continuity Key or your local wallet password through support. Keep recovery material stored privately and use supported on-device unlock options such as local wallet password and approved biometrics where available.",
        ],
      },
      {
        id: "network-visibility",
        title: "Commitment Network visibility",
        body: [
          "The public Commitment Network is pseudonymous by default. It records wallet-linked and market-linked activity under platform identifiers rather than exposing a person's legal identity on public surfaces.",
          "Legal-name-backed visibility belongs only to approved organizations using the Human Reliability API under an active consent scope and auditable access rules.",
        ],
      },
    ],
  },
  {
    slug: ["proof-submission-mobile"],
    group: "Core Protocols",
    title: "Proof Submission and Mobile Capture",
    eyebrow: "Proof",
    summary:
      "Why some markets accept standard web proof, why stronger markets route into mobile capture, and how deadline pressure is applied.",
    searchTerms: [
      "proof submission",
      "mobile app proof",
      "desktop proof",
      "deadline countdown",
      "stp capture",
      "native bridge",
    ],
    sections: [
      {
        id: "desktop-vs-mobile",
        title: "Desktop and mobile roles",
        body: [
          "Desktop stays available for browsing, joining, funding, reviewing rules, and managing positions. STP-sensitive proof submission routes through the mobile app so the platform can use device-backed capture and time-bound challenge-response checks.",
          "Markets that do not require STP can still accept standard browser proof if the published rules allow it.",
        ],
      },
      {
        id: "deadline-pressure",
        title: "Deadline pressure and final countdown",
        body: [
          "Proof windows can show escalating countdown states as the deadline approaches. Final-hour states use stronger visual emphasis so the submission cut-off is clear before the window closes.",
          "Any audible countdown or final alert remains user-gesture armed or opt-in so playback respects browser and device rules.",
        ],
      },
      {
        id: "proof-result",
        title: "Result after proof",
        body: [
          "When proof closes cleanly and the result posts, the market moves into settlement and any shareable result artifact can appear on the next login if it was not seen live.",
          "If proof is missing or invalid, the result follows the market rule and the account sees the missed-result artifact and the published forfeiture outcome instead.",
        ],
      },
    ],
  },
  {
    slug: ["early-release-cashout"],
    group: "Reference",
    title: "Early Release and Cashout",
    eyebrow: "Settlement",
    summary:
      "What happens when you leave a live commitment early, when cashout becomes available, and how the fee math is shown before you confirm.",
    searchTerms: ["early release", "cashout", "forfeiture", "leave market", "settlement timing", "wallet posting"],
    sections: [
      {
        id: "early-release",
        title: "Early Release",
        body: [
          "Early Release closes a live commitment before the deadline. The platform shows the exact return amount before you confirm, including the 5% pre-deadline forfeiture of the original stake.",
          "Early Release is not the same as a successful resolution. It exits the live commitment early and returns only the published pre-deadline amount.",
        ],
      },
      {
        id: "cashout",
        title: "Cashout",
        body: [
          "Cashout appears only after the market resolves successfully and the posted settlement amount is ready to move into available wallet cash.",
          "Cashout is not shown while a market is still live, while proof is still open, or while a challenge or result window is still unresolved.",
        ],
      },
      {
        id: "quotes-and-confirmation",
        title: "Quotes and confirmation",
        body: [
          "Every Early Release action shows the exact return quote before confirmation so users can see the result before they proceed.",
          "The quote includes the pre-deadline forfeiture and makes clear that a completed result pays differently from an early exit.",
        ],
      },
    ],
  },
  {
    slug: ["spark-ruzomi"],
    group: "Product Surfaces",
    title: "Spark and Ruzomi",
    eyebrow: "Social",
    summary:
      "How the in-market feed, the broader social network, joined market rails, reactions, GIFs, and public reading rules work together.",
    searchTerms: [
      "spark",
      "ruzomi",
      "social network",
      "reactions",
      "gifs",
      "joined markets",
      "direct sparks",
    ],
    sections: [
      {
        id: "roles",
        title: "Spark and Ruzomi roles",
        body: [
          "Spark is the live message and reaction layer attached to commitment markets and shared network surfaces. Ruzomi is the fuller social-network experience built around those same live commitment channels.",
          "Joined commitment markets become the active channels in Ruzomi. This replaces generic server lists with the commitment markets the user actually joined.",
        ],
      },
      {
        id: "guest-vs-account",
        title: "Guest and signed-in rules",
        body: [
          "Guests can read public feed items, but posting, reacting, replying, polls, market ideas, and direct Sparks require a signed-in account.",
          "Protected Galactus features inside social surfaces stay gated behind the verified-completion rule even for signed-in accounts.",
        ],
      },
      {
        id: "artifacts-and-sharing",
        title: "Artifacts and sharing",
        body: [
          "Completed and missed-result artifacts can appear in Spark, on profiles, and inside the broader Ruzomi network once they are posted or shared.",
          "Artifacts are built for download, internal sharing, and external sharing without exposing private proof assets by default.",
        ],
      },
    ],
  },
  {
    slug: ["profiles-goals-completed"],
    group: "Product Surfaces",
    title: "Profiles and Goals Completed",
    eyebrow: "Profile",
    summary:
      "What appears on a public profile, how current commitments can be hidden, and how Goals Completed is structured.",
    searchTerms: ["profile", "goals completed", "current commitments", "missed commitments", "visibility"],
    sections: [
      {
        id: "profile-sections",
        title: "Profile sections",
        body: [
          "Profiles can show current commitments, Goals Completed, missed commitments, performance trend, and public Spark history.",
          "Current commitments can be hidden if the account holder wants a lower-visibility profile, but completed history and artifact sharing follow the profile's published visibility settings.",
        ],
      },
      {
        id: "proof-privacy",
        title: "Proof privacy",
        body: [
          "Private proof assets are hidden by default. Public profile surfaces show market status, result, and artifact state without exposing private uploaded evidence.",
          "Shared artifacts can show proof-linked status and verification seals without revealing the underlying private proof files.",
        ],
      },
      {
        id: "goals-completed",
        title: "Goals Completed",
        body: [
          "Goals Completed is the profile section that records verified finished commitments after the relevant result window closes.",
          "The section is designed to show outcome history clearly without collapsing active, missed, and completed commitments into one mixed list.",
        ],
      },
    ],
  },
  {
    slug: ["quickstart-galactus-access"],
    group: "Overview",
    title: "Quickstart and Galactus Access",
    eyebrow: "Quickstart",
    summary:
      "How new users move through the first commitment flow and when Galactus unlocks for generation, support, docs, and sales.",
    searchTerms: [
      "quickstart",
      "galactus access",
      "unlock ai",
      "first commitment",
      "30 day window",
      "eligibility",
    ],
    sections: [
      {
        id: "quickstart",
        title: "Quickstart path",
        body: [
          "The quickstart path walks new users through email verification, identity verification, funding, first commitment, and the first verified completion.",
          "Each step stays visible so the user can see what is already finished, what is next, and what still unlocks later in the product.",
        ],
      },
      {
        id: "galactus-lock",
        title: "Galactus access rule",
        body: [
          "Galactus stays locked until the user completes one verified commitment within the last 30 days. The same rule applies to generation, docs AI, and the direct Galactus support or sales conversation.",
          "If the user goes inactive long enough for the active window to expire, the product shows the countdown, the reason access is locked, and the next step required to restore access.",
        ],
      },
      {
        id: "mobile-proof",
        title: "Mobile proof requirement",
        body: [
          "Desktop can be used to browse, join, fund, and manage markets. STP-sensitive proof submission is routed through the mobile app so the platform can use device-backed capture.",
          "This keeps high-trust proof capture consistent while leaving market discovery and funding accessible on larger screens.",
        ],
      },
    ],
  },
  {
    slug: ["notifications-and-deadline-states"],
    group: "Product Surfaces",
    title: "Notifications and Deadline States",
    eyebrow: "Notifications",
    summary:
      "What the notification panel shows, how proof reminders escalate, and how Generate and Galactus unlock notices are delivered.",
    searchTerms: [
      "notifications",
      "deadline states",
      "proof reminder",
      "unlock notice",
      "countdown",
      "bell",
    ],
    sections: [
      {
        id: "notification-panel",
        title: "Notification panel",
        body: [
          "The notification panel is available only to signed-in users. It groups proof deadlines, opening markets, result posts, Spark activity, and account state changes in one place.",
          "Guests do not see the notification bell because none of those account-specific states exist without a signed-in session.",
        ],
      },
      {
        id: "unlock-reminders",
        title: "Generate and Galactus reminders",
        body: [
          "When Generate unlocks, the board shows a visible unlock state and the mode order changes immediately. As the active window ages, the account also sees how much time remains before Generate and Galactus lock again.",
          "If the window expires, the product explains the reason directly and points to the next verified completion required to restore access.",
        ],
      },
    ],
  },
  {
    slug: ["enterprise-sales-setup"],
    group: "Enterprise",
    title: "Enterprise Sales and HRS Setup",
    eyebrow: "Sales",
    summary:
      "How enterprise and small-business teams request Human Reliability API access, what Galactus asks, and how billing and consent are reviewed.",
    searchTerms: [
      "sales",
      "enterprise setup",
      "hrs setup",
      "api application",
      "small business",
      "consent review",
    ],
    sections: [
      {
        id: "application",
        title: "Application flow",
        body: [
          "The sales flow collects organization details, contact details, usage expectations, declared use case, and consent acknowledgement before protected enterprise access is reviewed.",
          "Galactus leads the direct sales conversation after the account earns the active access window, but the enterprise request form and public docs stay available before that direct thread opens.",
        ],
      },
      {
        id: "billing",
        title: "Billing and API setup",
        body: [
          "Approved enterprise accounts receive scoped keys, usage billing visibility, and a developer path for integration and audit review.",
          "Usage billing is metered. The organization is charged for approved protected access volume, not for unrestricted seat counts.",
        ],
      },
      {
        id: "eligibility",
        title: "Galactus sales eligibility",
        body: [
          "The same verified-completion rule that unlocks Galactus elsewhere also gates the direct sales conversation.",
          "Public docs and the enterprise request form stay available before that direct AI sales thread opens, so evaluation and intake can still move forward cleanly.",
        ],
      },
      {
        id: "application-details",
        title: "What Galactus asks for",
        body: [
          "The application collects organization name, contact details, request band, use case, workflow impact, and whether consent-backed legal-name matching is required. That gives Galactus enough context to qualify the right billing lane and access scope.",
          "Small businesses and enterprise teams follow the same application structure. The difference is the protected traffic level, review depth, and integration support needed after approval.",
        ],
      },
    ],
  },
  {
    slug: ["galactus-runtime-and-video-review"],
    group: "Reference",
    title: "Galactus Runtime and Video Review",
    eyebrow: "Galactus",
    summary:
      "How GPT-5.4 runs Galactus, where Twelve Labs fits into video analysis, and how budget and policy guardrails stay in place.",
    searchTerms: [
      "gpt-5.4",
      "galactus runtime",
      "video review",
      "twelve labs",
      "responses api",
      "reasoning effort",
    ],
    sections: [
      {
        id: "core-runtime",
        title: "Core runtime",
        body: [
          "Galactus runs on GPT-5.4 through the OpenAI Responses API. The same runtime handles market drafting, support, docs answers, sales conversations, structured question flow, and execution updates.",
          "Production can pin a GPT-5.4 snapshot for stability, while staging can stay on the rolling alias during controlled testing.",
        ],
      },
      {
        id: "video-boundary",
        title: "Video understanding boundary",
        body: [
          "Twelve Labs is used only when a user uploads video. It analyzes the uploaded footage and returns structured observations, timestamps, and summaries that Galactus can use as context.",
          "Twelve Labs does not replace Galactus as the reasoning layer. GPT-5.4 remains the final reasoning and orchestration model even when video context is present.",
        ],
      },
      {
        id: "cost-and-guardrails",
        title: "Cost and guardrails",
        body: [
          "Galactus uses token budgets, tool-call caps, reasoning-effort policies, and workflow-level cost accounting before new AI-heavy features are allowed into production.",
          "That keeps the runtime bounded by real margin guardrails instead of assuming unlimited model spend behind the scenes.",
        ],
      },
    ],
  },
  {
    slug: ["support-sales-and-docs-with-galactus"],
    group: "Enterprise",
    title: "Support, Docs, and Sales with Galactus",
    eyebrow: "Galactus",
    summary:
      "How Galactus handles support, docs, and enterprise sales while staying locked behind the same verified-completion rule.",
    searchTerms: [
      "support galactus",
      "docs galactus",
      "sales galactus",
      "ask galactus",
      "eligibility",
      "support access",
    ],
    sections: [
      {
        id: "shared-access-rule",
        title: "Shared access rule",
        body: [
          "Galactus does not open for docs, market generation, or the direct support and sales conversation until the account has one verified completed commitment inside the active 30-day window.",
          "If an ineligible account tries to send a protected AI request, the system returns a direct explanation and the next step required to unlock access.",
          "That response is automatic across docs, support, sales, and market drafting. Public help and enterprise intake still stay reachable while the direct Galactus channel remains protected.",
        ],
      },
      {
        id: "bounded-answers",
        title: "Bounded answers",
        body: [
          "Galactus answers from approved documentation, approved policy, scoped account context, and approved enterprise knowledge through the GPT-5.4 runtime. The system refuses unsupported requests rather than improvising outside those boundaries.",
          "Support, docs, and sales each use the same core access rule while staying limited to their approved tools and knowledge scope.",
        ],
      },
      {
        id: "video-boundary",
        title: "Video review boundary",
        body: [
          "If a workflow includes uploaded video, Twelve Labs can analyze the footage first and return structured timestamps and observations for Galactus to review.",
          "That video analysis stays bounded to uploaded video evidence only. Galactus remains the final reasoning layer for support, docs, sales, and proof-related explanations.",
        ],
      },
      {
        id: "voice-layer",
        title: "Voice layer",
        body: [
          "Where voice is enabled, Galactus can respond through server-side ElevenLabs output. Voice remains policy-selected and tied to the approved product context rather than direct user control.",
          "Voice output can be used for enterprise sales, selected support moments, and high-stakes verification prompts where spoken guidance improves completion.",
        ],
      },
    ],
  },
  {
    slug: ["fees-usage-billing"],
    group: "Reference",
    title: "Fees and Usage Billing",
    eyebrow: "Fees",
    summary:
      "Consumer funding fees, Sovereign Spark infrastructure fees, settlement capture, and enterprise usage billing.",
    searchTerms: ["fees", "usage billing", "sovereign spark", "settlement tax", "enterprise billing"],
    sections: [
      {
        id: "consumer-fees",
        title: "Consumer fees",
        body: [
          "Card and instant funding charge 2.5%. ACH funding is free. Wire funding requires a $1,000 minimum and a flat $20 fee.",
          "Each commitment stake carries a 5% Sovereign Spark infrastructure fee. Sovereign Spark covers platform compute and verification infrastructure.",
        ],
      },
      {
        id: "settlement-tax",
        title: "Settlement capture",
        body: [
          "If at least one entrant completes, PayToCommit captures 20% of the failed or forfeited side before the remaining forfeitures are distributed to the completed side.",
          "If nobody completes, the failed side closes fully to the platform under the published market rule.",
        ],
      },
      {
        id: "enterprise-billing",
        title: "Enterprise usage billing",
        body: [
          "Enterprise API access is billed by protected usage. Billing reflects scoped request volume and the audit coverage attached to those protected lookups.",
          "Enterprise billing is separate from the consumer fee stack and does not grant unrestricted access to protected user records.",
        ],
      },
    ],
  },
  {
    slug: ["fees"],
    group: "Reference",
    title: "Fees and Usage Billing",
    eyebrow: "Fees",
    summary:
      "Alias path for fees and usage billing.",
    searchTerms: ["fees", "billing", "usage"],
    sections: [
      {
        id: "alias",
        title: "Fees and billing",
        body: [
          "This path maps to the current fees and usage billing reference. Use the Fees and Usage Billing reference for the complete fee stack, funding fees, and enterprise usage billing rules.",
        ],
      },
    ],
  },
];

export function getDocPageBySlug(slug: string[]) {
  return docsPages.find((page) => page.slug.join("/") === slug.join("/")) ?? docsPages[0];
}

export function getDocPath(slug: string[], docsHost = false) {
  const joined = slug.join("/");
  if (docsHost) {
    return joined ? `/${joined}` : "/";
  }
  return joined ? `/docs/${joined}` : "/docs";
}

export function getDocsSearchResults(query: string) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return docsPages.map<DocsSearchResult>((page) => ({
      slug: page.slug,
      title: page.title,
      summary: page.summary,
      group: page.group,
      match: page.summary,
    }));
  }

  return docsPages
    .map<DocsSearchResult | null>((page) => {
      const haystack = [
        page.title,
        page.summary,
        page.group,
        ...page.searchTerms,
        ...page.sections.flatMap((section) => [section.title, ...section.body]),
      ];

      const matched = haystack.find((entry) => entry.toLowerCase().includes(normalized));

      if (!matched) {
        return null;
      }

      return {
        slug: page.slug,
        title: page.title,
        summary: page.summary,
        group: page.group,
        match: matched,
      };
    })
    .filter((page): page is DocsSearchResult => Boolean(page));
}
