import type { LegalDocument } from "@/lib/types";

export const LEGAL_OPERATOR = "PayToCommit";
export const LEGAL_ADDRESS = "405 Magnolia Road, Pemberton NJ, 08889";
export const LEGAL_EFFECTIVE_DATE = "March 8, 2026";

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms",
    title: "Terms of Use",
    summary: "The agreement that governs account access, wallet funding, ticket placement, proof, AI review, payouts, Chains, Spark, and developer use.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "acceptance",
        title: "Acceptance and scope",
        paragraphs: [
          "These Terms of Use govern access to the PayToCommit websites, docs surfaces, mobile-accessible pages, APIs, wallet services, Spark feeds, Commitment Network views, and any related support channels operated under the PayToCommit name.",
          "By creating or using an account, funding a wallet, joining a pool, joining a Chain, submitting proof, posting to Spark, or using a PayToCommit API key, you agree to these terms and to the related policies referenced by them.",
          "If you do not agree, do not use the service.",
        ],
      },
      {
        id: "accounts",
        title: "Accounts, eligibility, and identity",
        paragraphs: [
          "You must provide accurate account information and keep it current. PayToCommit may require identity, sanctions, fraud, age, or location checks before permitting funding, wallet withdrawals, developer access, or higher-risk activity.",
          "PayToCommit may restrict or refuse access where a user, location, payment source, or activity pattern creates legal, compliance, operational, fraud, or safety risk.",
        ],
        bullets: [
          "Accounts may not be shared or transferred without written authorization.",
          "You are responsible for activity that occurs through your account credentials or wallet session.",
          "PayToCommit may suspend, limit, or close an account where verification remains incomplete or unreliable.",
        ],
      },
      {
        id: "pools",
        title: "Pools, Chains, proof, and result state",
        paragraphs: [
          "A pool is a published commitment with a fixed deadline, proof window, challenge window, and payout rule. Every entrant is attempting to resolve completed. There is no public yes or no side.",
          "A Chain links exactly two pools. Both legs must resolve completed for the Chain to finish clean. If either leg misses, the Chain fails. Chain payouts must remain fully funded by Chain participants and forfeitures.",
          "You are responsible for reading the pool rules before joining. PayToCommit publishes rules pages as HTML product surfaces and those rules govern what counts.",
        ],
      },
      {
        id: "settlement",
        title: "AI verification, disputes, and finality",
        paragraphs: [
          "Proof review begins with the published rules. PayToCommit uses autonomous multimodal verification and appeal workflows for disputed, incomplete, manipulated, or unclear outcomes.",
          "If at least one entrant completes, PayToCommit captures twenty percent of the forfeited side before distributing the remaining forfeited balance to the completed side. If nobody completes, PayToCommit captures the full pool.",
          "Once a dispute window closes and the final AI ruling is issued, the result is final except where PayToCommit later discovers fraud, compliance issues, technical failure, or a material rules conflict.",
        ],
      },
      {
        id: "wallet",
        title: "Wallet funding, fees, payouts, and reversals",
        paragraphs: [
          "Wallet cash is the spendable balance used to join pools and Chains. Funding becomes available only after confirmation through the supported payment rails.",
          "ACH funding is free. Card and instant funding charge 2.5 percent. Each commitment stake carries a 5 percent Sovereign Spark infrastructure fee.",
          "PayToCommit may place holds, reverse credits, cancel payouts, or reduce wallet balances where funding is reversed, fraud is suspected, compliance review is pending, or a payout was issued in error.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Notice",
    summary: "How PayToCommit collects, uses, stores, and shares account data, wallet data, proof data, Spark content, and consent-gated reliability data.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "collection",
        title: "Information collected",
        paragraphs: [
          "PayToCommit collects information you provide directly, including account details, profile data, support requests, wallet funding details, payout details, developer app details, and content you post to Spark.",
          "The product also records pool tickets, Chain tickets, proof submissions, review decisions, network entries, device and browser metadata, cookies, diagnostic events, and abuse-prevention signals.",
        ],
      },
      {
        id: "use",
        title: "How information is used",
        paragraphs: [
          "Information is used to operate the product, fund wallets, place tickets, run AI proof review, close disputes, calculate payouts, detect fraud, enforce policies, maintain audit trails, improve product reliability, and respond to support requests.",
          "PayToCommit may also use information to meet legal obligations, prevent sanctions violations, respond to law enforcement or regulator requests, and protect the rights, safety, and integrity of PayToCommit, its users, and the broader service.",
        ],
      },
      {
        id: "sharing",
        title: "Sharing and consent-gated access",
        paragraphs: [
          "PayToCommit shares data with payment processors, infrastructure vendors, analytics and security vendors, content moderation tools, support systems, and other service providers acting on PayToCommit’s behalf.",
          "Reliability or identity-related data is not available for open search. Any developer or enterprise access that references a protected account state must be consent-based, scoped, and auditable.",
        ],
      },
      {
        id: "retention",
        title: "Retention and deletion",
        paragraphs: [
          "PayToCommit keeps records for as long as needed to operate the service, meet legal or compliance obligations, resolve disputes, maintain financial records, enforce policies, and defend against claims.",
          "Some records, such as settlement decisions, network entries, and financial ledger entries, may be retained beyond account closure where required for audit or compliance reasons.",
        ],
      },
    ],
  },
  {
    slug: "responsible-participation",
    title: "Responsible Participation",
    summary: "Guidance on using PayToCommit responsibly, understanding risk, and avoiding misuse or harmful overextension.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "risk",
        title: "Risk and self-management",
        paragraphs: [
          "PayToCommit is built around real money commitments. Do not fund or stake amounts you cannot afford to lose. The product is not a guarantee that you will complete a task, improve a habit, or receive a payout.",
          "If product use begins to feel harmful, compulsive, financially unsafe, or emotionally destabilizing, stop using the service and seek appropriate support.",
        ],
      },
      {
        id: "controls",
        title: "Participation controls",
        paragraphs: [
          "PayToCommit may offer limits, cooldowns, or support tools to help a user reduce activity. PayToCommit may also impose limits or restrictions where it detects harmful or unsafe behavior.",
        ],
      },
      {
        id: "support",
        title: "Support and intervention",
        paragraphs: [
          "Support can help with account limits, self-exclusion requests, policy explanations, payout timing, and wallet-access policy documentation. Support cannot recover lost wallet recovery material, reset local wallet credentials, bypass wallet-sensitive protections, or override final result rules unless a published exception or verified service failure applies.",
          "PayToCommit will not ask a user to disclose the 12-Word Continuity Key or a local wallet password through support channels.",
        ],
      },
    ],
  },
  {
    slug: "reward-terms",
    title: "Reliability Reward Terms",
    summary: "Eligibility, unlock conditions, fee-coverage rules, and anti-abuse restrictions for the Reliability Reward program.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "program",
        title: "Program structure",
        paragraphs: [
          "The Reliability Reward program credits wallet cash when an invited account finishes three successful resolved stakes and the fee cycle generated by that referral relationship fully covers the reward liability.",
          "Current launch rules target a $10 wallet credit for the referrer and a $10 wallet credit for the invited account once the unlock conditions are satisfied.",
        ],
      },
      {
        id: "eligibility",
        title: "Eligibility and exclusions",
        paragraphs: [
          "PayToCommit may refuse, reverse, or hold a reward where it detects duplicate accounts, self-referrals, recycled payment methods, abuse, manipulation, or policy violations.",
          "Rewards are not payable as instant external cash. They are credited to wallet cash and remain subject to the general wallet, payout, fraud, and compliance policies.",
        ],
      },
      {
        id: "changes",
        title: "Program changes",
        paragraphs: [
          "PayToCommit may modify or discontinue the program, adjust reward amounts, change unlock conditions, or suspend the program in any region or account segment at any time.",
        ],
      },
    ],
  },
  {
    slug: "developer-agreement",
    title: "Developer Agreement",
    summary: "Rules for API keys, scoped access, audit obligations, consent-gated reliability data, and prohibited developer uses.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "keys",
        title: "Keys and scope",
        paragraphs: [
          "Every API key is issued to a named application with declared scopes. You must keep keys confidential, rotate them where appropriate, and immediately revoke any key you believe may be compromised.",
          "Keys are limited to the scopes granted. Access to protected reliability or identity-related data requires explicit consent and a corresponding audit trail.",
        ],
      },
      {
        id: "restrictions",
        title: "Restricted developer uses",
        paragraphs: [
          "Developers may not attempt open legal-name search, broad profile scraping, shadow scoring, hidden surveillance, discriminatory profiling, resale of protected data, or any use that conflicts with PayToCommit’s consent model or applicable law.",
          "Developers may not work around rate limits, retention rules, access revocations, or technical safeguards.",
        ],
      },
      {
        id: "compliance",
        title: "Audit and compliance",
        paragraphs: [
          "PayToCommit may suspend, limit, review, or terminate keys or applications that create risk, misuse protected data, exceed scope, or fail to meet audit and security expectations.",
          "Developers must cooperate with incident response, misuse investigations, and data-subject handling where their application or use of PayToCommit data is implicated.",
        ],
      },
    ],
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    summary: "Posting and conduct rules for Spark, public profile fields, replies, hearts, GIFs, and community-facing activity.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "expected",
        title: "What belongs on Spark",
        paragraphs: [
          "Spark exists for updates, commitment context, useful questions, proof-adjacent notes, and social momentum around live pools and Chains.",
          "Short reactions are fine. Noise that overwhelms proof or attempts to distort a result is not.",
        ],
      },
      {
        id: "prohibited",
        title: "Prohibited conduct",
        paragraphs: [
          "Do not post abuse, threats, harassment, hate content, illegal content, spam, deceptive proof claims, doxxing, impersonation, malware, or manipulative campaigns intended to distort trust in the service.",
          "Do not use GIFs, replies, or reaction brigading to bury relevant proof, intimidate other users, or disrupt the review process.",
        ],
      },
      {
        id: "enforcement",
        title: "Enforcement",
        paragraphs: [
          "PayToCommit may remove content, limit posting, disable reactions, restrict media posting, suspend accounts, or preserve evidence for review when policy violations are suspected.",
        ],
      },
    ],
  },
  {
    slug: "dispute-policy",
    title: "Dispute Policy",
    summary: "How disputes are opened, what evidence matters, who decides a final result, and when a result can be reopened.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "opening",
        title: "Opening a dispute",
        paragraphs: [
          "A dispute must be opened within the published challenge window unless PayToCommit confirms a material service failure or fraud issue that prevented a timely challenge.",
          "Dispute reports should focus on missing proof, altered proof, deadline mismatch, rules mismatch, or other evidence that changes the result outcome.",
        ],
      },
      {
        id: "review",
        title: "Review standard",
        paragraphs: [
          "The AI verification and appeal systems evaluate the published rules, proof artifacts, submission times, challenge notes, system records, and any other evidence PayToCommit considers relevant. Public sentiment and reaction counts do not decide the result.",
          "PayToCommit may request more evidence, maintain the existing ruling, reverse the ruling, void the pool, or apply another remedy permitted by the rules and these policies.",
        ],
      },
      {
        id: "finality",
        title: "Finality and exceptions",
        paragraphs: [
          "Final decisions are binding except where PayToCommit later identifies fraud, technical failure, compliance restrictions, or a material rules inconsistency.",
        ],
      },
    ],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    summary: "What you may not do with the websites, wallet, APIs, Spark, docs, or other PayToCommit services.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "abuse",
        title: "Abuse and interference",
        paragraphs: [
          "You may not interfere with the service, probe for vulnerabilities without permission, evade rate limits, bypass restrictions, abuse automation, or degrade the experience for others.",
          "You may not submit false proof, fabricate identity signals, create networks of coordinated fake accounts, or exploit wallet or payout logic.",
        ],
      },
      {
        id: "illegal",
        title: "Illegal or restricted activity",
        paragraphs: [
          "You may not use PayToCommit in violation of any applicable law, sanctions regime, export control, anti-money laundering rule, consumer protection rule, or other legal restriction.",
        ],
      },
      {
        id: "remedies",
        title: "Remedies",
        paragraphs: [
          "PayToCommit may suspend or terminate access, cancel rewards, void payouts, hold wallet balances, or take any other lawful protective action where this policy is violated or circumvention is attempted.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Notice",
    summary: "How cookies and similar technologies are used for session continuity, product state, analytics, security, and support.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "types",
        title: "Cookie categories",
        paragraphs: [
          "PayToCommit uses essential cookies for product continuity, session state, wallet and board stability, and security features. The product may also use performance, diagnostics, analytics, and preference cookies where permitted.",
        ],
      },
      {
        id: "controls",
        title: "Controls and browser settings",
        paragraphs: [
          "You may be able to control certain cookie behaviors through browser settings or consent tools. Blocking essential cookies can break core product functions, including wallet state continuity and authenticated service access.",
        ],
      },
      {
        id: "updates",
        title: "Updates",
        paragraphs: [
          "PayToCommit may update this notice as product features, vendors, regulations, or measurement practices change.",
        ],
      },
    ],
  },
  {
    slug: "security",
    title: "Security Overview",
    summary: "How PayToCommit approaches infrastructure, payment handling, access control, moderation systems, and incident response.",
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    updatedDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        id: "controls",
        title: "Core controls",
        paragraphs: [
          "PayToCommit uses access controls, provider-managed infrastructure protections, audit logs, payment processor integrations, environment-based secret handling, and service monitoring to protect the product and its records.",
          "The service does not expose server secrets in client bundles. Payment handling is delegated to supported payment processors and wallet credit depends on confirmed events rather than optimistic balance updates.",
        ],
      },
      {
        id: "reporting",
        title: "Security reporting",
        paragraphs: [
          "Security reports may be sent through the support and security contact surfaces published by PayToCommit. Include clear reproduction steps, affected routes, impact summary, and any supporting evidence available.",
        ],
      },
      {
        id: "limits",
        title: "Important limits",
        paragraphs: [
          "No internet-connected service is perfectly secure. PayToCommit does not promise uninterrupted availability or that any single control will prevent all misuse, fraud, or unauthorized access.",
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: string) {
  return legalDocuments.find((document) => document.slug === slug) ?? null;
}
