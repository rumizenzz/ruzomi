# Developer Portal Benchmark

Date: March 11, 2026

## Sources reviewed

- OpenAI Developers
- OpenAI API Platform docs
- Supabase Docs
- GitHub REST API docs
- Discord Developer Platform docs
- Reddit for Developers docs

## Repeated patterns worth keeping

- Persistent left navigation with clear grouping by getting started, reference, operations, and resources.
- Search at the top of the shell, not buried inside the content.
- Quickstart and API reference treated as separate, equally important lanes.
- A visible bridge from docs into support, status, changelog, and community.
- Operational surfaces that explain billing, usage, webhooks, and dashboard/reporting state instead of pretending docs stop at endpoints.
- Dense but readable cards that let users jump into the most common tasks without flattening the whole portal into one long article.

## OpenAI Developers

- Strongest overall pattern for combining developer home, docs IA, quickstarts, reference, and dashboard entry in one surface.
- Left navigation remains dense but understandable, and the API docs lane separates guides, tools, pricing, reference, and operational topics well.
- Strong lesson for PayToCommit: the HRS API, webhooks, pricing, quickstarts, and dashboard lane need to be clearly separated rather than mixed into one generic page.

## Supabase Docs

- Best product and module wayfinding.
- The docs home acts like a catalog: quickstarts first, then products, then modules, then references.
- Strong lesson for PayToCommit: lead with quickstarts and integration lanes, then branch into HRS API, billing, exports, dashboard, and troubleshooting.

## GitHub REST Docs

- Best exhaustive reference density.
- Strong breadcrumbing, huge reference hierarchy, strong support and contribution links, and very clear route-family expansion.
- Strong lesson for PayToCommit: the API reference must feel complete and structured, not like a short marketing summary with a few links.

## Discord Developer Platform

- Best clean developer-home routing into product areas, quickstart, help center, and community.
- Strong lesson for PayToCommit: the developer home should feel like a proper gateway with clear “what are you trying to build?” choices, not only a docs entry page.

## Reddit for Developers

- Good example of a docs home that mixes getting-started, examples, community, and support paths without overwhelming the user.
- Strong lesson for PayToCommit: developer surfaces should point to community, examples, and support directly from the portal, not force users to discover those elsewhere.

## PayToCommit implementation direction

- `developers.paytocommit.com` becomes the canonical developer portal host.
- `platform.paytocommit.com` becomes a host-aware alias that emphasizes dashboard, reporting, and enterprise operations.
- `/developers` on the main host remains available, but it now renders the same full portal shell instead of a thin marketing page.
- The portal shell should keep:
  - search-first navigation
  - persistent grouped left nav
  - quickstarts
  - HRS API
  - webhooks
  - pricing/usage billing
  - dashboard/reporting
  - troubleshooting
  - changelog
  - support/sales bridges
