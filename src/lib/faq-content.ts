import type { FaqItem, FaqSearchResult, FaqSection } from "@/lib/types";

export const faqSections: FaqSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "Account access, identity, and first commitments.",
    description: "Start with the basics, unlock funding, and understand how the first commitment works.",
  },
  {
    id: "commitment-markets",
    title: "Commitment Markets",
    summary: "How markets open, close, settle, and verify.",
    description: "Read how dates, proof, nested markets, and visible totals work before you join.",
  },
  {
    id: "funds-payouts",
    title: "Funds & payouts",
    summary: "Wallet cash, funding methods, fees, and cashout timing.",
    description: "Know how funding works, when cash posts, and how completed markets pay out.",
  },
  {
    id: "reliability-enterprise",
    title: "Reliability & enterprise",
    summary: "Consent, API access, and enterprise usage.",
    description: "Protected access, Human Reliability API coverage, and the enterprise billing model.",
  },
  {
    id: "spark-and-support",
    title: "Spark, help, and access",
    summary: "Ruzomi, Spark, Docs AI, support, and access rules.",
    description: "How social posting, help routes, and Galactus access work across the network.",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "what-is-paytocommit",
    sectionId: "getting-started",
    question: "What is PayToCommit?",
    searchTerms: ["paytocommit", "what is this", "how it works", "commitment board"],
    answer: [
      "PayToCommit is a commitment market where you stake on your own goal, submit proof before the deadline, and get paid when you finish under the published rules.",
      "Every market shows the goal, join window, proof mode, result timing, and payout rules before you commit.",
    ],
  },
  {
    id: "create-account",
    sectionId: "getting-started",
    question: "How do I create an account?",
    searchTerms: ["signup", "create account", "join", "register"],
    answer: [
      "Use signup to create your account with email and password, or continue with Google, Apple, or Discord where available.",
      "Once your account is live, you can browse markets, join Spark, save drafts, and move into identity verification only when you are ready to fund your wallet or place a live stake.",
    ],
  },
  {
    id: "browse-before-login",
    sectionId: "getting-started",
    question: "Can I browse markets before I create an account?",
    searchTerms: ["guest browse", "view without login", "window shop", "guest markets", "read fractal markets"],
    answer: [
      "Yes. Guests can read the board, open market detail, move through Fractal Markets, and watch live pulse graphs without a login wall.",
      "The account wall appears only when you try to lock a live stake, save a protected action, or open a direct Galactus conversation.",
    ],
  },
  {
    id: "why-verify-identity",
    sectionId: "getting-started",
    question: "Why do I need identity verification?",
    searchTerms: ["kyc", "identity", "verify", "funding"],
    answer: [
      "Identity verification is not required to create an account. It becomes required when you try to fund the wallet or place a live stake because wallet cash, payouts, and proof-linked settlements run through verified accounts only.",
      "PayToCommit uses Stripe Identity to confirm legal identity, government ID, and any required live capture steps before funding opens.",
    ],
  },
  {
    id: "unlock-generate-mode",
    sectionId: "getting-started",
    question: "When does Generate unlock on the Commitment Board?",
    searchTerms: ["generate", "locked", "create market", "command center"],
    answer: [
      "Generate unlocks after you complete at least one verified commitment within the last 30 days.",
      "Until then, the board stays in Search mode so you can browse live markets, join existing goals, and see how proof and settlement work before drafting a new one.",
    ],
  },
  {
    id: "quickstart-path",
    sectionId: "getting-started",
    question: "What does Quickstart do for a new account?",
    searchTerms: ["quickstart", "new account", "first steps", "onboarding"],
    answer: [
      "Quickstart shows the shortest path from signup to your first verified completed commitment: verify email, pick a commitment, deposit your first $10 when you are ready to stake, and finish it cleanly.",
      "It also shows what still unlocks later, including Generate and the rest of the Galactus access window.",
    ],
  },
  {
    id: "when-do-invite-rewards-post",
    sectionId: "getting-started",
    question: "When do invite rewards actually post?",
    searchTerms: ["referral", "invite reward", "10 dollars", "referrer", "invited user", "reward posts"],
    answer: [
      "Invite rewards post only after the invited user signs up, funds the wallet, places the first live stake, and completes that first verified commitment.",
      "When that verified result posts, $10 can release to the invited user and $10 can release to the referrer. Before that final verified finish, the tracker stays in progress instead of paying early.",
    ],
  },
  {
    id: "why-quickstart-is-compact",
    sectionId: "getting-started",
    question: "Why is Quickstart small on the board instead of taking over the whole page?",
    searchTerms: ["quickstart compact", "small quickstart", "home quickstart", "profile quickstart"],
    answer: [
      "Quickstart is designed to guide the account without interrupting market discovery. It stays visible on the board and profile route once the email is confirmed, but it does not block the rest of the product.",
      "The dedicated quickstart route is still available when you want the full checklist and the longer enterprise setup path.",
    ],
  },
  {
    id: "galactus-access-rule",
    sectionId: "getting-started",
    question: "When can I talk to Galactus?",
    searchTerms: ["galactus", "ask ai", "support ai", "docs ai", "sales ai"],
    answer: [
      "Galactus unlocks only after one verified completed commitment within the last 30 days. The same rule applies to generation, docs AI, and the direct Galactus support or sales conversation.",
      "Public docs and public help pages stay readable without Galactus, and support or enterprise intake can still start without the direct AI conversation.",
      "If you try to use a locked Galactus surface anyway, the product responds with the same direct rule and points you back to the next step that restores access.",
    ],
  },
  {
    id: "choose-market",
    sectionId: "commitment-markets",
    question: "How do I choose a commitment market?",
    searchTerms: ["choose market", "pick market", "goal", "category"],
    answer: [
      "Start with the category, deadline, proof mode, and stake band. If the rules fit the goal you want to finish, you can commit from the board or the full market page.",
      "Markets that are still very new can show activity without a full visible pool total until they pass the published visibility threshold.",
    ],
  },
  {
    id: "hidden-totals",
    sectionId: "commitment-markets",
    question: "Why can a market show activity before it shows the full pooled total?",
    searchTerms: ["hidden total", "reveal threshold", "pooled total", "activity", "liquidity"],
    answer: [
      "Very new markets can keep the full pooled total hidden until they pass the published reveal threshold. This keeps the opening phase readable without overstating what is already public.",
      "The market can still show timing, proof mode, stake band, and controlled activity signals before the full total is revealed.",
    ],
  },
  {
    id: "what-runs-galactus",
    sectionId: "spark-and-support",
    question: "What runs Galactus?",
    searchTerms: ["what runs galactus", "gpt-5.4", "twelve labs", "docs ai runtime", "support ai runtime"],
    answer: [
      "Galactus runs on GPT-5.4 through the OpenAI Responses API for reasoning, drafting, support, docs, and sales.",
      "If a workflow includes uploaded video, Twelve Labs can analyze the footage first and return structured video context that Galactus uses in the same thread.",
    ],
  },
  {
    id: "open-close-dates",
    sectionId: "commitment-markets",
    question: "How do opening dates, join windows, and closing dates work?",
    searchTerms: ["opening", "join window", "deadline", "closing date", "start date"],
    answer: [
      "Each market has a start window, a join window, a proof deadline, and a result window. You can only join while the join window is open.",
      "PayToCommit AI drafts these dates when a new market is created, but the dates do not go live until the creator explicitly opens the market.",
    ],
  },
  {
    id: "fractal-markets",
    sectionId: "commitment-markets",
    question: "What are Fractal Markets inside a commitment market?",
    searchTerms: ["fractal", "nested", "sub-market", "markets inside markets"],
    answer: [
      "Fractal Markets are nested goal tracks inside a parent commitment market. They let a broad goal break into smaller tracked paths, each with its own proof view and timing.",
      "The parent market stays the main settlement container, while the fractal tracks show the progress structure inside it.",
    ],
  },
  {
    id: "proof-submit",
    sectionId: "commitment-markets",
    question: "How do I submit proof for my goal?",
    searchTerms: ["submit proof", "proof", "upload", "deadline"],
    answer: [
      "Open the market before the proof window closes and submit the proof requested in the rules. Markets can require text, image, video, or higher-trust native capture depending on the goal.",
      "If a market needs stronger proof capture, PayToCommit routes you into the required capture flow before the submission window closes. STP-sensitive proof submission is handled through the mobile app, not desktop upload alone.",
    ],
  },
  {
    id: "desktop-vs-mobile-proof",
    sectionId: "commitment-markets",
    question: "Why can I stake on desktop but still need the mobile app to submit proof?",
    searchTerms: ["desktop", "mobile app", "submit proof", "stp", "native bridge"],
    answer: [
      "Desktop is available for browsing, funding, joining, and managing positions. Some markets still require mobile proof because the rules need device-backed capture and timed challenge-response checks that the browser alone cannot provide.",
      "The market tells you which proof mode it needs before you commit, so the mobile requirement is clear before funds are at risk.",
    ],
  },
  {
    id: "desktop-stake-mobile-handoff",
    sectionId: "commitment-markets",
    question: "What happens after I stake on desktop and the product says proof is mobile-only?",
    searchTerms: ["desktop stake mobile-only", "qr handoff", "funds are staked", "proof is mobile only", "smart link"],
    answer: [
      "The desktop session keeps the stake locked and opens a handoff state that says your funds are already staked and proof continues on mobile.",
      "From there you can scan the QR code or use the smart link to continue the same market and stake on your phone without losing the session context.",
    ],
  },
  {
    id: "ai-rejects-markets",
    sectionId: "commitment-markets",
    question: "Why can PayToCommit AI reject a market draft?",
    searchTerms: ["reject", "draft denied", "unsafe", "unverifiable"],
    answer: [
      "PayToCommit AI rejects drafts that are harmful, illegal, abusive, or not verifiable enough to settle cleanly.",
      "If a draft cannot be verified by the published proof rules, the system explains why and asks for a safer or more concrete version instead of opening the market.",
    ],
  },
  {
    id: "deposit-funds",
    sectionId: "funds-payouts",
    question: "How do I deposit funds?",
    searchTerms: ["deposit", "add funds", "fund wallet", "apple pay", "google pay", "debit", "ach"],
    answer: [
      "Once your identity is verified, Add Funds routes you into the dedicated funding screen where you can choose Apple Pay, Google Pay, debit card, or ACH and wire.",
      "Funding availability depends on device and processor eligibility. ACH and wire use a $1,000 minimum and a flat $20 fee.",
    ],
  },
  {
    id: "sovereign-spark",
    sectionId: "funds-payouts",
    question: "What is the Sovereign Spark fee?",
    searchTerms: ["sovereign spark", "infrastructure fee", "fees", "pricing"],
    answer: [
      "Sovereign Spark is the 5% infrastructure fee attached to each commitment stake. It covers the verification and AI systems used to run the market.",
      "It is separate from the Settlement Tax, which is the platform capture from the failed or fraudulent side of a market.",
    ],
  },
  {
    id: "completed-payout",
    sectionId: "funds-payouts",
    question: "What happens when a market settles and I completed my goal?",
    searchTerms: ["settlement", "completed", "payout", "winnings"],
    answer: [
      "Completed entrants recover their qualifying stake and receive their share of the failed side under the market rules after fees.",
      "Wallet cash posts after settlement is final and any published proof or challenge windows are closed.",
    ],
  },
  {
    id: "early-release",
    sectionId: "funds-payouts",
    question: "What is Early Release?",
    searchTerms: ["early release", "leave market", "5% forfeiture", "exit early"],
    answer: [
      "Early Release closes a live commitment before the deadline and applies the published 5% pre-deadline forfeiture of the original stake.",
      "The product shows the exact return amount before confirmation so you can see the effect before you leave the market.",
    ],
  },
  {
    id: "cashout-timing",
    sectionId: "funds-payouts",
    question: "When can I cash out?",
    searchTerms: ["cash out", "withdraw", "payout timing", "wallet"],
    answer: [
      "You can cash out posted wallet balance after identity verification is complete and the relevant funding or settlement events have posted.",
      "Pending funding, pending settlements, and active holds do not count as spendable or withdrawable cash until they clear.",
    ],
  },
  {
    id: "human-reliability-api",
    sectionId: "reliability-enterprise",
    question: "What is the Human Reliability API?",
    searchTerms: ["human reliability api", "enterprise", "api", "reliability"],
    answer: [
      "The Human Reliability API is a consent-gated enterprise API that returns protected reliability signals derived from verified commitment history.",
      "Approved scopes can include current HRS standing, live trend direction, and identity-backed matching to the consenting person's legal identity. It is built for banks, enterprises, platforms, and other organizations that need auditable access to user-approved reliability data.",
    ],
  },
  {
    id: "hrs-score-start",
    sectionId: "reliability-enterprise",
    question: "Does every user start with a Human Reliability score?",
    searchTerms: ["hrs start", "new score", "no score", "credit score"],
    answer: [
      "No. New accounts start without a reliability score. The score begins building only after verified commitment history starts to accumulate.",
      "The score can rise, flatten, dip, and recover over time. Enterprise views can use that trend only within the user's granted consent scope.",
    ],
  },
  {
    id: "consent-required",
    sectionId: "reliability-enterprise",
    question: "Do enterprises need consent to use reliability data?",
    searchTerms: ["consent", "enterprise", "protected data", "legal name"],
    answer: [
      "Yes. Protected reliability lookups require active user consent, a scoped enterprise key, and a declared access purpose.",
      "There is no open legal-name lookup and no unrestricted bulk search across user records. Legal-name-backed matching becomes available only when the user granted that identity scope to the approved integration.",
    ],
  },
  {
    id: "legal-name-backed-consent",
    sectionId: "reliability-enterprise",
    question: "Can an approved enterprise review my record under my legal name?",
    searchTerms: ["legal name", "identity scope", "consent-backed match", "enterprise legal name", "protected identity"],
    answer: [
      "Yes, but only when you grant the identity scope to that approved organization for the declared purpose. Without that scope, the organization cannot match the protected record to your legal identity.",
      "That consent makes your earned record usable for that approved review. It does not create a stronger score or turn the API into open people search.",
    ],
  },
  {
    id: "enterprise-visibility",
    sectionId: "reliability-enterprise",
    question: "What can an approved enterprise see when consent is active?",
    searchTerms: ["enterprise visibility", "legal name", "hrs trend", "consent scope", "what can they see"],
    answer: [
      "With the granted scope, an approved enterprise can review the protected reliability record tied to the consenting person's legal identity, current HRS standing, and the live trend history allowed by that consent.",
      "Without that scope, the enterprise cannot see legal-name-backed matching and cannot read outside the remaining granted access window.",
    ],
  },
  {
    id: "consent-and-opportunity",
    sectionId: "reliability-enterprise",
    question: "Does consent change the score itself?",
    searchTerms: ["consent change score", "more opportunities", "hrs score", "consent benefit"],
    answer: [
      "Consent does not manufacture points or inflate the score on its own. The score still comes from verified commitment history.",
      "What consent can do is make that verified record available to approved organizations that the user wants to work with, which can open more opportunities without changing how the score is earned.",
    ],
  },
  {
    id: "why-grant-consent",
    sectionId: "reliability-enterprise",
    question: "Why would a user grant enterprise consent in the first place?",
    searchTerms: ["why consent", "opportunities", "legal-name consent", "hrs opportunities", "why grant scope"],
    answer: [
      "Consent lets an approved organization review the verified record you already earned instead of seeing no protected reliability history at all.",
      "That can make your live HRS history, recovery pattern, and legal-name-backed match usable for approved decisions when you want that record considered. It does not manufacture points or override the way the score is actually earned.",
    ],
  },
  {
    id: "legal-name-enterprise-access",
    sectionId: "reliability-enterprise",
    question: "Can an approved enterprise review the consenting person's legal-name-backed record?",
    searchTerms: ["legal name", "identity scope", "consent-backed identity", "enterprise record"],
    answer: [
      "Yes, but only when the user granted the identity scope to that approved integration. Without that scope, the protected record cannot be matched to the user's legal identity.",
      "With the granted scope, approved teams can review current HRS, live trend direction, and the protected history allowed by that consent.",
    ],
  },
  {
    id: "billing-usage",
    sectionId: "reliability-enterprise",
    question: "How does enterprise billing work?",
    searchTerms: ["billing", "usage", "metered", "enterprise pricing", "api key"],
    answer: [
      "Enterprise billing is usage-based. Protected calls, audit coverage, consent-scoped access, and live HRS dashboard usage determine billable usage.",
      "API keys are scoped, logged, and tied to enterprise accounts so access stays auditable from request through response.",
    ],
  },
  {
    id: "realtime-enterprise-history",
    sectionId: "reliability-enterprise",
    question: "Can an approved enterprise see live score changes and history?",
    searchTerms: ["realtime hrs", "history graph", "trend", "plateau", "recovery", "live score"],
    answer: [
      "Yes, within the granted consent scope. Approved enterprise views can follow the protected HRS trend, including rises, plateaus, recoveries, and the latest verified changes tied to that record.",
      "That view is still scoped, logged, and purpose-bound. It is not an unrestricted history feed across every user on the platform.",
    ],
  },
  {
    id: "sales-access",
    sectionId: "reliability-enterprise",
    question: "How do enterprise teams start the sales flow?",
    searchTerms: ["sales", "enterprise form", "hrs setup", "application", "contact sales"],
    answer: [
      "Enterprise and small-business teams start from the sales route, where the organization submits its use case, expected request volume, consent requirements, legal-identity scope needs, and contact details.",
      "Public enterprise docs stay readable without sign-in. Direct Galactus-led sales access follows the same recent verified-completion rule used for other protected AI features.",
    ],
  },
  {
    id: "small-business-fit",
    sectionId: "reliability-enterprise",
    question: "Is the Human Reliability API only for large enterprises?",
    searchTerms: ["small business", "enterprise fit", "api for small team", "hrs for startups"],
    answer: [
      "No. The Human Reliability API is built for enterprises, platforms, and smaller businesses that need consent-backed reliability review for real decisions.",
      "The application flow still asks for your request band, use case, and scope so Galactus can qualify the right billing and integration path before protected access opens.",
    ],
  },
  {
    id: "legal-name-why",
    sectionId: "reliability-enterprise",
    question: "Why would an organization ask for legal-name-backed matching?",
    searchTerms: ["why legal name", "identity scope", "matching reason", "legal-name review"],
    answer: [
      "Some organizations need to know that the protected reliability record belongs to the exact person they are reviewing. That is why identity-backed matching exists as a separate consent scope.",
      "Without that granted scope, the organization cannot tie the record to the user's legal identity. With that scope, it can review the same earned reliability history for the approved purpose under that person's legal name.",
    ],
  },
  {
    id: "mobile-proof-requirement",
    sectionId: "commitment-markets",
    question: "Why do some markets require the mobile app for proof?",
    searchTerms: ["mobile proof", "desktop proof", "native capture", "why phone required"],
    answer: [
      "Some markets require stronger capture than a desktop browser can provide. Those markets use mobile proof so the platform can run device-backed capture, timed challenge-response, and the right proof checks for that market.",
      "You can still browse, fund, join, and manage markets on desktop. The rules tell you before you commit if proof must be submitted through the mobile app.",
    ],
  },
  {
    id: "credit-score",
    sectionId: "reliability-enterprise",
    question: "Is Human Reliability a credit score substitute?",
    searchTerms: ["credit score", "substitute", "reliability", "score"],
    answer: [
      "No. Human Reliability is a consent-based performance signal built from verified commitment history, not a replacement for regulated credit reporting.",
      "Organizations should treat it as a distinct reliability signal and use it only within the consent scope granted by the user.",
    ],
  },
  {
    id: "spark-vs-ruzomi",
    sectionId: "spark-and-support",
    question: "What is the difference between Spark and Ruzomi?",
    searchTerms: ["spark", "ruzomi", "social network", "difference"],
    answer: [
      "Spark is the feed, reply, and reaction layer attached to markets. Ruzomi is the wider social-network experience built around those same commitment channels.",
      "Joined commitment markets become your channels inside Ruzomi, which replaces generic server lists with the markets you actually joined.",
    ],
  },
  {
    id: "support-access-rule",
    sectionId: "spark-and-support",
    question: "Why can I read docs and help but still not talk to Galactus?",
    searchTerms: ["support access", "docs ai locked", "ask galactus locked", "help vs ai"],
    answer: [
      "Public docs, FAQ, and help pages stay open so anyone can understand the platform. Direct Galactus conversations are protected features and require one verified completed commitment inside the active 30-day window.",
      "Support intake and enterprise request forms stay reachable even before that direct Galactus window opens.",
      "If that requirement is missing, the product tells you exactly what step unlocks access instead of opening a half-working chat: finish one verified commitment and return inside the 30-day window.",
      "That same automatic answer appears across docs, support, sales, and market generation so the access rule stays consistent everywhere Galactus appears.",
    ],
  },
  {
    id: "guest-spark-rules",
    sectionId: "spark-and-support",
    question: "Can a guest react or post inside Spark?",
    searchTerms: ["guest spark", "anonymous reaction", "guest post", "reply as guest"],
    answer: [
      "No. Guests can read public activity, but posting, reacting, replying, voting, and idea creation all require a signed-in account.",
      "The product does not create fake placeholder posting identities for unsigned visitors.",
    ],
  },
  {
    id: "contact-sync-optional",
    sectionId: "spark-and-support",
    question: "Do I have to sync contacts to invite friends?",
    searchTerms: ["contact sync", "invite friends", "contacts", "optional", "mobile invite"],
    answer: [
      "No. Contact sync is optional. The mobile app asks for permission before reading contacts and lets you keep that access off if you do not want to use it.",
      "If you do grant access, the app can show which contacts are already on the platform and which people can receive a direct invite link.",
    ],
  },
  {
    id: "guest-stake-auth-capture",
    sectionId: "spark-and-support",
    question: "Why can I browse markets as a guest but need an account to stake?",
    searchTerms: ["guest browse", "stake login wall", "auth modal", "friction-light auth", "guest stake"],
    answer: [
      "PayToCommit keeps browsing open so guests can read markets, inspect Fractal Markets, and watch pulse graphs before any account wall appears.",
      "The account wall appears only when you try to lock a live stake, save another protected action, or open a direct Galactus conversation. That keeps discovery open while still capturing the account and the exact market intent before money moves.",
    ],
  },
  {
    id: "desktop-mobile-handoff-after-stake",
    sectionId: "spark-and-support",
    question: "What happens after I stake on desktop and proof is mobile-only?",
    searchTerms: ["desktop stake", "mobile-only proof", "qr code", "smart link", "funds are staked"],
    answer: [
      "The desktop session keeps the stake locked and opens a handoff state that says your funds are already staked and proof continues on mobile.",
      "From there you can scan the QR code or use the smart link to continue on your phone without losing the market, stake amount, or next proof step.",
    ],
  },
  {
    id: "result-artifacts",
    sectionId: "spark-and-support",
    question: "What are result artifacts and when do they appear?",
    searchTerms: ["result artifacts", "victory artifact", "loss artifact", "share card"],
    answer: [
      "Result artifacts are the branded cards that appear after a market resolves. Completed results can reveal a victory artifact and missed results can reveal a forfeiture artifact.",
      "If you were offline when the result posted, the artifact can appear on the next login so the outcome is still visible and shareable.",
    ],
  },
];

export function getFaqSearchResults(query: string) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return faqItems.map<FaqSearchResult>((item) => ({
      id: item.id,
      sectionId: item.sectionId,
      question: item.question,
      match: item.answer[0] ?? item.question,
    }));
  }

  return faqItems
    .map<FaqSearchResult | null>((item) => {
      const haystack = [item.question, ...item.searchTerms, ...item.answer];
      const match = haystack.find((entry) => entry.toLowerCase().includes(normalized));

      if (!match) {
        return null;
      }

      return {
        id: item.id,
        sectionId: item.sectionId,
        question: item.question,
        match,
      };
    })
    .filter((item): item is FaqSearchResult => Boolean(item));
}
