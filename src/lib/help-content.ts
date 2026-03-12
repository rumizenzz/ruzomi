import type { HelpArticle, HelpSearchResult, HelpSection } from "@/lib/types";

export const helpSections: HelpSection[] = [
  {
    id: "guides",
    title: "Guides",
    summary: "Learn the product flow.",
    description: "Account setup, identity, funding, and commitment flow walkthroughs.",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    summary: "Fix common issues.",
    description: "Reset links, blocked funding, proof issues, and missed deadlines.",
  },
  {
    id: "contact",
    title: "Contact",
    summary: "Reach the right team.",
    description: "Account access, funding, payouts, proof, and developer questions.",
  },
  {
    id: "community",
    title: "Community",
    summary: "Stay close to Spark.",
    description: "Spark etiquette, reporting, and shared market activity.",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    summary: "HRS and API access.",
    description: "Consent, enterprise application, billing, and Human Reliability API setup.",
  },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: "account-access",
    sectionId: "guides",
    title: "Account access",
    summary: "How login, signup, and identity handoff work.",
    searchTerms: ["login", "signup", "account", "verify", "identity"],
    body: [
      "Use login if you already have an account. Use signup if you need a new account. Identity does not start during signup.",
      "Identity starts only when you choose to fund the wallet or place a live stake. Funding stays locked until that verification is complete.",
      "If you started a market draft before signing in, complete login or signup and the draft resumes where you left it.",
    ],
  },
  {
    slug: "guest-browsing-and-first-stake",
    sectionId: "guides",
    title: "Guest browsing and the first stake",
    summary: "How guests can read markets first and when the login wall actually appears.",
    searchTerms: ["guest browsing", "read without login", "first stake", "auth modal", "login wall"],
    body: [
      "Guests can browse Commitment Markets, open full market pages, read Fractal Market detail, and watch live pulse graphs without signing in first.",
      "The account wall appears only when a guest tries to lock a live stake. At that point the product opens the friction-light account capture flow so the session, intent, and next step stay intact before any funding or identity work begins.",
    ],
  },
  {
    slug: "funding-and-payouts",
    sectionId: "guides",
    title: "Funding and payouts",
    summary: "How wallet cash, funding methods, and payout timing work.",
    searchTerms: ["wallet", "funding", "deposit", "payout", "apple pay", "google pay", "wire"],
    body: [
      "Verified accounts can fund by Apple Pay, Google Pay, debit card, or ACH and wire where eligible. ACH and wire follow the published minimum and fee rules.",
      "Wallet cash becomes available after the funding event is confirmed. Payout timing follows the market result and any open proof or challenge window.",
      "Support can point you to wallet-access rules and payout policy, but support cannot recover a lost 12-Word Continuity Key, reset your local wallet password, or unlock wallet-sensitive access on your behalf.",
    ],
  },
  {
    slug: "wallet-access-and-recovery",
    sectionId: "troubleshooting",
    title: "Wallet access and recovery",
    summary: "How wallet-sensitive access works on-device and what the 12-Word Continuity Key is for.",
    searchTerms: [
      "continuity key",
      "wallet recovery",
      "wallet password",
      "face id",
      "fingerprint",
      "new device wallet",
      "support cannot recover wallet",
    ],
    body: [
      "The Commitment Wallet is separate from basic account login. On supported devices you can unlock wallet-sensitive views with a local wallet password and approved biometrics such as Face ID or fingerprint unlock.",
      "If you move to a new device or lose wallet-sensitive access, you may be asked to re-enter your 12-Word Continuity Key under the published recovery rules. Keep that key stored somewhere safe and private.",
      "PayToCommit support can point you to the wallet-access policy and published recovery steps, but support cannot recover a lost 12-Word Continuity Key, cannot reset the local wallet password, cannot unlock the wallet for you, and will never ask you to send the key or your wallet password to support.",
    ],
  },
  {
    slug: "proof-and-deadlines",
    sectionId: "guides",
    title: "Proof and deadlines",
    summary: "How proof windows, challenge windows, and result timing work.",
    searchTerms: ["proof", "deadline", "challenge", "result", "submit proof"],
    body: [
      "Every market shows a deadline, proof window, and result window before you join. Submit proof before the proof window closes.",
      "STP-sensitive markets route proof submission through the mobile app so the platform can run device-backed capture. Late proof is handled by the published market rules. If a challenge window is open, the market stays in review until the result posts.",
    ],
  },
  {
    slug: "generate-eligibility",
    sectionId: "guides",
    title: "Generate eligibility",
    summary: "Why the board can stay in Search mode and how Generate unlocks.",
    searchTerms: ["generate", "eligibility", "search mode", "locked", "galactus"],
    body: [
      "Search is the default board mode for guests, new users, and inactive users. Generate unlocks only after you complete one verified commitment within the last 30 days.",
      "When your active window is live, the board shows the remaining access time. If that window expires, Generate locks again until you complete another verified commitment.",
    ],
  },
  {
    slug: "quickstart-guide",
    sectionId: "guides",
    title: "Quickstart guide",
    summary: "The shortest path from signup to a verified first commitment.",
    searchTerms: ["quickstart", "first commitment", "first deposit", "unlock ai", "getting started"],
    body: [
      "Quickstart walks through email confirmation, choosing a first commitment, depositing your first $10 when you are ready to fund or stake, the first live stake, and the first verified completed commitment.",
      "Direct Galactus conversations stay locked until that first verified completion happens, so Quickstart makes it clear what still needs to be done and what unlocks next.",
    ],
  },
  {
    slug: "referrals-and-invites",
    sectionId: "guides",
    title: "Referrals and invites",
    summary: "How invite rewards work, which steps count, and when the $10 rewards actually post.",
    searchTerms: [
      "referral",
      "invite",
      "invite reward",
      "10 dollars",
      "tracker",
      "countdown",
      "friend invite",
    ],
    body: [
      "The invite reward releases only after the invited account signs up, funds the wallet, places the first live stake, and completes that first verified commitment. When that verified result posts, $10 can release to the invited user and $10 can release to the referrer.",
      "The referral tracker keeps both accounts on the same checklist so every required step is visible in order. If the reward window is close to expiring, the product can show the countdown and send reminder prompts before the final proof step closes.",
    ],
  },
  {
    slug: "compact-quickstart",
    sectionId: "guides",
    title: "Compact quickstart on home and profile",
    summary: "Why the quickstart card shows on the board and inside account settings only after email confirmation.",
    searchTerms: ["compact quickstart", "home quickstart", "profile quickstart", "email confirmed"],
    body: [
      "The compact quickstart appears only after the account is signed in and the email is confirmed. It stays visible on the Commitment Board and the profile route so the next step is always close by without taking over the screen.",
      "The card is meant to feel like a small guide rail: pick a market first, then deposit your first $10 when you are ready to fund or stake, finish one verified commitment, and unlock Galactus.",
    ],
  },
  {
    slug: "contact-sync-and-invite-consent",
    sectionId: "community",
    title: "Contact sync and invite consent",
    summary: "How contact sync works on mobile, what permission it needs, and what is shown before you send an invite.",
    searchTerms: [
      "contact sync",
      "contacts",
      "invite friends",
      "sync contacts",
      "mobile invite",
      "consent",
    ],
    body: [
      "Contact sync is optional. The mobile app asks for permission before reading contacts, shows who is already on the platform, and lets you send direct invites only after that permission is granted.",
      "The contact view is designed for clear choices: keep sync off, grant access once, or manage it later in settings. It is not required to use the rest of the product.",
    ],
  },
  {
    slug: "ruzomi-and-spark",
    sectionId: "guides",
    title: "Ruzomi and Spark",
    summary: "How the full network and the in-market feed work together.",
    searchTerms: ["ruzomi", "spark", "network", "joined markets", "social feed"],
    body: [
      "Spark is the live feed and reply layer attached to markets. Ruzomi is the broader network experience built around those same commitment channels.",
      "Joined commitment markets become your active channels in Ruzomi. Guests can read public items, but posting, reacting, replies, and market ideas require an account.",
    ],
  },
  {
    slug: "reset-password",
    sectionId: "troubleshooting",
    title: "Reset password",
    summary: "How to send a reset email and set a new password.",
    searchTerms: ["password", "reset", "forgot password", "recovery"],
    body: [
      "Use the password recovery page to send a reset email. Open the link in the email to set a new password on the dedicated reset page.",
      "If the recovery link has expired, request a new reset email and try again from the latest message.",
    ],
  },
  {
    slug: "locked-funding",
    sectionId: "troubleshooting",
    title: "Locked funding",
    summary: "Why Add Funds can route you into verification before funding opens.",
    searchTerms: ["locked funding", "verify identity", "kyc", "add funds"],
    body: [
      "Add Funds routes by account state. Guests go to auth. Signed-in users who are not verified go to identity first. Verified users go to funding methods.",
      "If funding is still locked after verification, refresh the wallet route and check that the identity session completed successfully.",
    ],
  },
  {
    slug: "missed-proof-window",
    sectionId: "troubleshooting",
    title: "Missed proof window",
    summary: "What happens if proof is not posted before the window closes.",
    searchTerms: ["missed proof", "late proof", "deadline missed"],
    body: [
      "If proof is not posted before the proof window closes, the market resolves under the published rules. Some markets can still accept structured incident evidence if the rules allow it.",
      "Always check the market rules before the deadline so you know the final submission cut-off.",
    ],
  },
  {
    slug: "mobile-proof-submission",
    sectionId: "troubleshooting",
    title: "Mobile proof submission",
    summary: "Why some proof routes leave desktop and continue inside the mobile app.",
    searchTerms: ["mobile proof", "desktop proof", "native capture", "stp"],
    body: [
      "Some markets require stronger proof capture than a desktop browser can provide. Those markets route proof submission through the mobile app so the platform can run device-backed capture and timed challenge-response checks.",
      "Desktop remains available for browsing, joining, funding, and reviewing rules. If a market needs mobile proof, the rules tell you before you commit.",
    ],
  },
  {
    slug: "desktop-stake-mobile-handoff",
    sectionId: "troubleshooting",
    title: "Desktop stake and mobile handoff",
    summary: "What the desktop handoff means after you lock a stake and why proof continues on mobile.",
    searchTerms: ["desktop handoff", "qr code", "smart link", "proof continues on mobile", "funds are staked"],
    body: [
      "After you lock a stake on desktop, some markets can show a mobile-only proof handoff. That means the money is already locked and the next required proof step continues in the mobile app.",
      "Use the smart link or QR code on that screen to open the handoff page on your phone. The handoff keeps the market, stake amount, and next capture step attached to the same session.",
    ],
  },
  {
    slug: "early-release-and-cashout",
    sectionId: "troubleshooting",
    title: "Early Release and cashout",
    summary: "What happens when you leave early and when cashout becomes available.",
    searchTerms: ["early release", "cashout", "leave early", "forfeiture", "wallet post"],
    body: [
      "Early Release exits a live commitment before the deadline and returns the published amount after the 5% pre-deadline forfeiture is applied. The exact quote is shown before confirmation.",
      "Cashout is different. It appears only after a successful result posts and the settlement amount becomes available in your wallet.",
    ],
  },
  {
    slug: "galactus-access",
    sectionId: "troubleshooting",
    title: "Galactus access",
    summary: "Why Galactus can stay locked and what restores access.",
    searchTerms: ["galactus", "docs ai", "support ai", "sales ai", "locked ai"],
    body: [
      "Galactus is available only after one verified completed commitment within the last 30 days. The same rule applies to generation, docs AI, and the direct Galactus support or sales conversation.",
      "If the active window expires, the product tells you why access is locked and what step restores it. The fastest path back is to complete another verified commitment.",
      "If you try to open a protected Galactus surface too early, the system answers with that same access rule instead of opening a half-working AI chat. Public help and enterprise intake still stay reachable.",
    ],
  },
  {
    slug: "guest-stake-capture",
    sectionId: "troubleshooting",
    title: "Guest stake capture",
    summary: "Why guests can browse first, why the account wall appears only at stake time, and what happens next.",
    searchTerms: [
      "guest stake",
      "auth modal",
      "friction light signup",
      "stake without login",
      "impulse stake",
    ],
    body: [
      "Guests can browse markets and Fractal Markets freely. The account capture wall appears only when a live stake starts so the product can preserve the exact market, stake intent, and next step without forcing a login too early.",
      "Once the account is captured, funding or staking can continue in the same session. If the market requires mobile proof, the product can then hand the user into the mobile proof flow without losing that locked market context.",
    ],
  },
  {
    slug: "contact-paths",
    sectionId: "contact",
    title: "Contact paths",
    summary: "Where to go for account, funding, proof, and developer questions.",
    searchTerms: ["contact", "support", "developer", "billing", "proof"],
    body: [
      "Use the account path for login, reset, and identity access questions. Use the funding path for wallet policy, funding, and payout issues.",
      "Use the proof path for deadline and result questions. Use the developer path for consent scopes, API access, and enterprise integration questions.",
    ],
  },
  {
    slug: "hrs-enterprise-access",
    sectionId: "contact",
    title: "HRS enterprise access",
    summary: "How organizations request Human Reliability API access and review consent and billing.",
    searchTerms: ["hrs", "human reliability api", "enterprise", "sales", "billing", "consent"],
    body: [
      "Enterprise and small-business teams can open the sales flow to describe their use case, expected request volume, and whether they need consent-backed legal-identity matching inside the Human Reliability API.",
      "Public docs cover the API, billing model, live HRS history view, and how legal-name-backed matching works when consent is active for approvals, underwriting, hiring, partner review, and other trust-sensitive decisions.",
      "Direct Galactus-led sales access stays gated behind the same recent verified-completion rule used elsewhere in the product.",
    ],
  },
  {
    slug: "developer-portal-and-platform-workspace",
    sectionId: "enterprise",
    title: "Developer portal and platform workspace",
    summary: "When to use developers.paytocommit.com, when to use platform.paytocommit.com, and what each one controls.",
    searchTerms: [
      "developer portal",
      "platform workspace",
      "developers.paytocommit.com",
      "platform.paytocommit.com",
      "projects",
      "api keys",
      "customer dashboard",
    ],
    body: [
      "Use developers.paytocommit.com for public evaluation: quickstarts, reference, webhook docs, pricing, sandbox access, production review, and strategic partner guidance.",
      "Use platform.paytocommit.com after sign-in to create organizations, projects, API keys, customer views, reports, billing, and audit history. Public docs explain the system first. The platform workspace runs the live integration after that.",
    ],
  },
  {
    slug: "employee-rollout-and-company-onboarding",
    sectionId: "enterprise",
    title: "Employee rollout and company onboarding",
    summary: "How enterprises invite employees by company email, review access requests, and roll out company-specific onboarding.",
    searchTerms: [
      "employee rollout",
      "company onboarding",
      "company email",
      "employee invite",
      "approval queue",
      "enterprise workforce",
      "direct deposit",
    ],
    body: [
      "Organizations can invite employees by company email from the platform workspace. Those invites attach the employee to the right organization after normal account creation instead of replacing the core PayToCommit account model.",
      "The workspace can review pending employee requests, approve in batches, restrict access with a recorded reason, and keep active commitments visible so nobody loses track of what is still due.",
      "Payroll-linked wallet funding and company-specific markets are optional rollout steps. They are configured from the same platform workspace that manages organizations, projects, reports, and audit history.",
    ],
  },
  {
    slug: "consent-and-legal-name-matching",
    sectionId: "enterprise",
    title: "Consent and legal-name matching",
    summary: "How approved organizations can review a consenting person's protected record under the identity scope.",
    searchTerms: ["legal-name matching", "consent scope", "identity scope", "enterprise review", "approved organization"],
    body: [
      "Approved organizations can review a consenting person's protected Human Reliability record under that person's legal identity only when the identity scope is granted for that use case.",
      "Without that scope, the same organization cannot match the protected record to the person's legal identity. Consent makes the earned record usable for that approved review. It does not inflate or manufacture the score itself.",
    ],
  },
  {
    slug: "first-deposit-and-first-stake",
    sectionId: "guides",
    title: "First deposit and first stake",
    summary: "What changes when you move from browsing into funding and how the first $10 path works.",
    searchTerms: ["first deposit", "first stake", "first 10 dollars", "identity starts", "join first market"],
    body: [
      "Identity does not start at account creation. It starts only when you move into funding or try to place a live stake in a commitment market.",
      "The first funding path is built around a clear first $10 step so you can fund, join a live commitment, and understand the wallet flow without guessing what comes next.",
    ],
  },
  {
    slug: "enterprise-fit-and-legal-name-review",
    sectionId: "enterprise",
    title: "Enterprise fit and legal-name review",
    summary: "How approved organizations use consent-backed legal-name matching and why that scope matters.",
    searchTerms: ["enterprise fit", "legal name", "identity match", "hrs review", "approved organizations"],
    body: [
      "Banks, employers, platforms, and small businesses can apply for protected Human Reliability API access when they need a consent-backed reliability signal for a real decision.",
      "If the identity scope is granted, the approved organization can review the consenting person's protected record under that person's legal identity. Without that scope, the same organization cannot run legal-name-backed matching.",
      "Consent makes an earned record usable for that approved opportunity. It does not create a stronger score by itself or turn the API into open people search.",
    ],
  },
  {
    slug: "request-bands-and-metered-billing",
    sectionId: "enterprise",
    title: "Request bands and metered billing",
    summary: "How Galactus qualifies enterprise usage and how protected billing works after approval.",
    searchTerms: ["request bands", "metered billing", "usage billing", "enterprise pricing", "hrs api cost"],
    body: [
      "The enterprise application asks for an expected request band so Galactus can place the organization on the right billing and integration path before access opens.",
      "Final billing is still usage-based. Protected requests, granted scopes, and audit coverage determine the real bill after launch.",
      "That keeps the Human Reliability API usable for both large enterprises and smaller teams that need the same consent-backed signal without forcing a flat package that does not match real traffic.",
    ],
  },
  {
    slug: "legal-name-consent",
    sectionId: "enterprise",
    title: "Legal-name consent",
    summary: "How consent-backed legal-name matching works and why organizations ask for it.",
    searchTerms: ["legal name", "identity consent", "matching", "hrs consent", "opportunity"],
    body: [
      "When a user grants the identity scope, an approved organization can connect the protected reliability record to that user's legal identity for the declared purpose.",
      "That does not create a better score on its own. It makes an earned record usable when the user wants it considered for an approved opportunity or review instead of leaving that verified history invisible.",
    ],
  },
  {
    slug: "enterprise-billing-request-bands",
    sectionId: "enterprise",
    title: "Enterprise billing and request bands",
    summary: "How Galactus qualifies usage, billing, and integration scope before protected access opens.",
    searchTerms: ["billing", "request bands", "usage", "enterprise pricing", "protected requests"],
    body: [
      "The enterprise application collects an expected request band so Galactus can qualify the right billing path before protected API access opens.",
      "Final billing is still usage-based. The request band is a planning input, not a flat guess that overrides actual protected traffic.",
    ],
  },
  {
    slug: "victory-and-forfeiture-artifacts",
    sectionId: "community",
    title: "Victory and forfeiture artifacts",
    summary: "How completed and missed-result artifacts appear, save, and share into Spark and Ruzomi.",
    searchTerms: ["victory artifact", "forfeiture artifact", "save image", "share to spark", "result card"],
    body: [
      "Completed and missed-result artifacts can appear right after settlement or on the next login if the account was offline when the market resolved.",
      "Each artifact can be saved as a branded image, shared into Spark, or sent outside the platform without exposing private proof files by default.",
    ],
  },
  {
    slug: "consent-and-opportunity",
    sectionId: "enterprise",
    title: "Consent and opportunity",
    summary: "How consent-backed legal identity can make a verified reliability record usable by approved organizations.",
    searchTerms: ["consent", "opportunity", "legal name", "identity scope", "enterprise review"],
    body: [
      "When a user grants the identity scope, an approved organization can review the protected reliability record under that user's legal identity for the declared purpose.",
      "Consent does not manufacture a better score. It makes an earned record usable for approved opportunities that depend on reliability review, legal-name-backed matching, and current HRS history.",
    ],
  },
  {
    slug: "docs-and-galactus",
    sectionId: "contact",
    title: "Docs and Galactus access",
    summary: "What stays public, what is gated, and what message appears when AI access is still locked.",
    searchTerms: ["docs ai", "ask galactus", "public docs", "galactus locked", "support lock"],
    body: [
      "Docs pages and docs search stay public. Ask Galactus stays locked until the account has one verified completed commitment in the active 30-day window, while public help and enterprise intake stay available.",
      "When an ineligible account tries to use a protected AI surface, the product responds with the same clear message everywhere: one verified completed commitment inside the last 30 days is required before the direct Galactus channel opens.",
      "Galactus runs on GPT-5.4 for docs, support, and sales. If a workflow includes uploaded video, Twelve Labs can analyze the footage first and return structured video context for Galactus to use.",
    ],
  },
  {
    slug: "spark-and-community",
    sectionId: "community",
    title: "Spark and community",
    summary: "How Spark posting, replies, reactions, and reporting work.",
    searchTerms: ["spark", "community", "reply", "reaction", "report"],
    body: [
      "Spark is open to signed-in users. Guests can read, but posting, reacting, replying, and market ideas require an account.",
      "Use reporting tools for abusive or irrelevant content. Keep posts tied to the market, the goal, or the result window.",
    ],
  },
  {
    slug: "victory-artifacts",
    sectionId: "community",
    title: "Victory artifacts and result cards",
    summary: "How completed and missed-result artifacts appear, download, and share.",
    searchTerms: ["victory artifact", "result card", "save image", "share", "proof of honor"],
    body: [
      "Completed and missed-result artifacts can appear on your next login if an unseen result has already posted. Each artifact can be downloaded and shared without exposing private proof files.",
      "Artifacts can post into Spark, travel across Ruzomi, or be shared externally as branded proof of the final result.",
    ],
  },
  {
    slug: "hrs-enterprise-setup",
    sectionId: "enterprise",
    title: "HRS enterprise setup",
    summary: "How an organization reviews consent, billing, and the Human Reliability API before applying.",
    searchTerms: ["hrs setup", "enterprise setup", "api billing", "consent"],
    body: [
      "The enterprise path starts with public documentation, then moves into the sales application flow once the account is eligible to talk to Galactus.",
      "Organizations review consent scope, usage billing, request bands, identity-backed matching needs, and the live HRS dashboard before protected API access is approved.",
    ],
  },
  {
    slug: "enterprise-billing-and-consent",
    sectionId: "enterprise",
    title: "Enterprise billing and consent",
    summary: "How usage billing works and why protected reliability lookups always require consent.",
    searchTerms: ["enterprise billing", "usage billing", "consent", "legal name lookup"],
    body: [
      "Enterprise billing is usage-based and tied to protected request volume. Scoped keys, auditability, declared purpose, and live HRS history access all remain attached to the request flow.",
      "There is no open legal-name lookup and no unrestricted public reliability search. Legal-name-backed matching is available only when that identity scope is active, and protected reliability access always requires active user consent.",
    ],
  },
];

export function getHelpArticleBySlug(slug: string) {
  return helpArticles.find((article) => article.slug === slug) ?? helpArticles[0];
}

export function getHelpSearchResults(query: string) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return helpArticles.map<HelpSearchResult>((article) => ({
      slug: article.slug,
      sectionId: article.sectionId,
      title: article.title,
      summary: article.summary,
      match: article.summary,
    }));
  }

  return helpArticles
    .map<HelpSearchResult | null>((article) => {
      const haystack = [article.title, article.summary, ...article.searchTerms, ...article.body];
      const match = haystack.find((entry) => entry.toLowerCase().includes(normalized));

      if (!match) {
        return null;
      }

      return {
        slug: article.slug,
        sectionId: article.sectionId,
        title: article.title,
        summary: article.summary,
        match,
      };
    })
    .filter((article): article is HelpSearchResult => Boolean(article));
}
