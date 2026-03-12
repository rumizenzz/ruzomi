# Kalshi UX Benchmark

## Benchmark scope

Artifact roots:

- structural rerun: `.e2e-artifacts/kalshi/20260308-191508`
- archived full-route pass: `.e2e-artifacts/kalshi/20260308-175319`
- live-order lifecycle reference: `.e2e-artifacts/kalshi/20260308-175319/orders`

Route-family coverage completed in the structural rerun:

- public home, desktop drawer, browse, category, market detail, and mobile home/browse
- docs welcome, quick-start create-order, quick-start mobile, and help center home
- authenticated home, drawer, search, portfolio, activity, settings, and market detail
- theme verification on settings and home in dark mode, followed by restored light mode
- live-money coverage remains referenced from the earlier completed lifecycle and was not repeated in this pass

Live-money benchmark status:

- completed
- order 1: `Buy Yes · John Cornyn`
- close-out: `Sell Yes · John Cornyn`
- market: `Texas Republican Senate nominee?`
- buy cost: `$0.81`
- sell payout: `$0.76`
- net impact from the lifecycle: `-$0.05`
- starting cash before the lifecycle: `$25.29`
- ending cash after the lifecycle: `$25.24`
- theme restored to light mode after the benchmark closed

## Structural rerun highlights

- The desktop hamburger is not a fallback. It is a permanent operating control on both public and authenticated shells.
- Kalshi exposes category breadth continuously through a second navigation band instead of hiding discovery behind a single search box.
- The public home is grouped into shelf modules with short literal headings like `Trending`, `2026 Primaries`, `Top movers`, `New`, and `Highest volume`.
- Logged-in surfaces keep the same shell. Cash, portfolio, alerts, and account tools are added without turning the product into a separate dashboard.
- Settings remains operational and flat, but Kalshi still preserves the same top shell, category band, and drawer affordance above it.
- Search, drawer, and market detail all behave like extensions of the same operating surface rather than separate page types.

## Public discovery findings

### Home and browse

- Kalshi keeps the product frame clear in seconds because the homepage is already a live board, not a pitch page.
- The top shell stays persistent and dense: logo, markets, live count, social, search, cash, portfolio, alerts, and drawer all fit without collapsing the hierarchy.
- The desktop drawer button stays visible even when the rest of the shell is already dense, which makes the board feel like a workstation instead of a brochure.
- Category orientation is continuous. The category rail is visible across public discovery routes and does not disappear when the board changes.
- The homepage is shelf-based rather than feed-based. Distinct modules create scanable blocks without requiring explanatory copy.
- Market rows compress title, status, odds context, recent movement, volume, timing, and related market count into a scan-friendly pattern.
- Above the fold is dominated by live inventory, not copy. Supporting copy exists, but the board owns the page.

### Calendar and category routes

- The `LIVE` state is treated like a permanent operating signal rather than a temporary badge.
- Category pages still feel like the same product because header, density, and board structure stay intact.
- Section headings stay literal. Kalshi rarely spends space narrating what the page is doing.
- The board scales from general discovery to category-specific views without changing the shell logic.

### Social feed

- The ideas feed is structurally useful because it stays tied to market objects.
- The weakness is hydration feel. It can look sparse before the feed fills in.
- PayToCommit should keep the same market-linked social layer but make it feel populated immediately.

## Public market-detail findings

- Market detail is the core benchmark pattern for PayToCommit.
- The page front-loads the market object, chart, row pricing, rules, timeline, social, related markets, and ticket in one composition.
- The right-side ticket stays visible and usable while the left column carries the contextual depth.
- Rules and timeline are not hidden behind a separate help system. They live with the market object.
- Social proof is below the core market context, not above it, which preserves clarity.

Weaknesses observed on market detail:

- repeated websocket churn
- Statsig warnings
- amplitude warnings
- Meta Pixel duplication warnings
- attribution attestation errors
- failed resource requests for market-specific data

PayToCommit takeaway:

- keep the same left-context / right-action composition
- keep the same visible rules and timeline
- remove the telemetry and request noise
- make proof freshness, review timing, and challenge state easier to scan than Kalshi’s price-action metadata

## Docs and help findings

- Docs feel operational, not decorative.
- The API site has a mature pattern: search, left navigation, `On this page`, dark-mode support, and deep route coverage.
- The help center uses a softer support-specific visual system while still feeling related to the product.
- Static pages and footer depth help Kalshi feel long-established.

Current reference check on March 8, 2026:

- `https://docs.kalshi.com/` still opens with a direct API welcome page instead of a brand story. The first choices are first-request setup, OpenAPI, demo environment, rate limits, reference, changelog, glossary, and WebSocket docs.
- `https://help.kalshi.com/trading/fees` keeps fee explanation short and practical. It explains that fees are charged on executed trades, points users to the complete fee schedule, and tells them where to inspect fees inside the order ticket.
- `https://help.kalshi.com/account/signing-up/signing-up-as-an-individual/referral-faqs` frames referrals as an account reward surface with requirements, limits, and withdrawal rules instead of a marketing campaign.
- `https://help.kalshi.com/account/responsible-risk-management` shows that Kalshi keeps high-risk account settings in a plain operational help pattern, not a branded landing pattern.

PayToCommit takeaway:

- docs must read like a production service with stable primitives, not an early-stage launch artifact
- help and docs can use softer variants of the main system without drifting into a different brand
- fees and rewards pages should answer the operational question first and keep the mechanics visible without filler

## Authenticated product findings

### Authenticated home

- Login does not collapse the product into a dashboard. Discovery remains the dominant surface.
- Cash, portfolio, notifications, trophies, and account entry sit inside the same top operating bar.
- The drawer adds positions and watchlist without replacing the main board.
- The drawer is a workspace extension, not just a nav panel.
- Search keeps the same market-first behavior after login and resolves directly into market/profile results without breaking the page frame.

### Account surfaces

- Profile, activity, transfers, documents, and settings live behind a lightweight account control instead of a heavy left-nav shell.
- Settings is visually restrained and long-form. It proves Kalshi is willing to flatten the styling when a surface is primarily operational.
- Even on settings, the top shell still carries the main navigation, category band, search, cash, and drawer affordances.
- The weakness is that some account routes become plainer than the market routes.

PayToCommit takeaway:

- authenticated surfaces should keep the same shell and scanning logic as public routes
- account routes can be calmer, but not visually detached from the product

## Theme findings

Observed:

- light mode preserves hierarchy better
- dark mode remains readable, but the layout loses some structural depth
- the theme preference persists from settings into authenticated discovery
- the difference is most visible in grouped shelf surfaces, where dark mode flattens card separation and weakens section boundaries

PayToCommit direction:

- remain light-first
- keep durable dark parity
- preserve grouping, column hierarchy, and scan speed in both modes
- avoid Kalshi’s dark-mode flattening

## Motion and interaction findings

### Header behavior

- sticky shell keeps the product feeling live
- category rail continuity does more work than heavy motion
- the always-visible desktop drawer makes the shell feel larger and more institutional

### Search focus

- search expands into a quick-result layer without leaving the page
- switching between `Markets` and `Profiles` keeps intent clear
- search results are dense, fast, and directly market-linked

### Drawer behavior

- the drawer turns the left edge into a positions and watchlist workspace
- it does not break the main board composition

### Market-row interaction

- hover states are restrained
- row density and position are more important than flashy row animation

### Order ticket

- the ticket updates quickly from buy/sell selection to amount entry to review state
- the review step compresses cost, odds, and payout into a tiny high-confidence panel
- live submit and close-out both surfaced additional pixel and attribution warnings
- the lifecycle remained understandable in spite of the event noise because the review, confirmation, and position states are tightly compressed
- close-out flow is efficient: the sell ticket preloaded the full held position, reducing friction for a complete exit

### Portfolio and activity refresh

- data is dense and useful
- background event noise is high
- portfolio reflected the closed lifecycle quickly and returned the account to `No open positions`
- activity logged both sides of the lifecycle as separate `Order Filled` and `Trade completed` events at `March 08 6:27 PM` and `March 08 6:28 PM`

## Visual noise and instability

This is Kalshi’s clearest weakness in the benchmark:

- websocket subscription spam
- Statsig warnings
- amplitude warnings
- pixel duplication warnings
- attribution errors
- transport and resource failures that do not fully break the page but are visible during inspection

PayToCommit should copy the operating density, not the telemetry noise.

## What changed in PayToCommit from this benchmark

- the shared public header now uses a permanent desktop hamburger, icon-only brand lockup, search, live count, and a full category band
- the category rail is persistent and no longer sliced down to a small subset
- the public home now opens directly into live, top-volume, opening, and settling shelves instead of an explainer-led hero
- the main board exposes title, state, pool size, deadline, proof mode, challenge window, and result timing in one row model
- the public and authenticated shells now share the same operating language instead of splitting into marketing chrome and dashboard chrome
- the authenticated overview now reads like a live desk with the same row grammar as the public board
- the console and shell copy were tightened to short literal labels instead of explanatory narration

## Remaining benchmark work

Completed in the final live pass:

- submitted the staged live order
- verified the resulting open-position state on market detail
- sold the resulting position
- confirmed portfolio and activity reflections after the lifecycle
- restored theme state to the original light-mode setting before benchmark close

Artifacts added during the structural rerun:

- `public/home-desktop.png`
- `public/drawer-desktop.png`
- `public/browse-desktop.png`
- `public/category-politics-desktop.png`
- `public/market-detail-desktop.png`
- `public/home-mobile.png`
- `public/browse-mobile.png`
- `docs/api-welcome-desktop.png`
- `docs/api-create-order-desktop.png`
- `docs/api-create-order-mobile.png`
- `docs/help-center-home-desktop.png`
- `auth/home-desktop.png`
- `auth/drawer-open-desktop.png`
- `auth/search-results-desktop.png`
- `auth/portfolio-desktop.png`
- `auth/activity-desktop.png`
- `auth/settings-desktop.png`
- `auth/market-detail-desktop.png`
- `themes/settings-dark-desktop.png`
- `themes/home-dark-desktop.png`
- `themes/settings-restored-light-desktop.png`
- `themes/home-restored-light-desktop.png`

Artifacts retained from the live-order pass:

- `orders/order-submitted-dark-desktop.png`
- `orders/review-sell-dark-desktop.png`
- `orders/order-closed-dark-desktop.png`
- `orders/portfolio-after-close-dark-desktop.png`
- `orders/activity-after-trades-dark-desktop.png`
- `themes/settings-restored-light-desktop.png`
