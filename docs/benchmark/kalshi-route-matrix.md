# Kalshi Route Matrix

Artifact roots:

- structural rerun: `.e2e-artifacts/kalshi/20260308-191508`
- archived full-route pass: `.e2e-artifacts/kalshi/20260308-175319`
- live-order lifecycle: `.e2e-artifacts/kalshi/20260308-175319/orders`

## Public discovery

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| home | `https://kalshi.com/` | logged out | `public/home-desktop.png`, `public/home-mobile.png` | Board-first homepage, dense top shell, permanent drawer control, persistent category rail, live-first hierarchy |
| browse | `https://kalshi.com/browse` | logged out | `public/browse-desktop.png`, `public/browse-mobile.png` | Market rows remain the core unit; grouped shelves and sort rails keep discovery inside the same shell |
| calendar/live | `https://kalshi.com/calendar` | logged out | `public/calendar-desktop.png` | Live count and event timing create strong urgency without extra copy |
| category | `https://kalshi.com/category/politics` | logged out | `public/category-politics-desktop.png` | Category view stays consistent with main board structure |
| ideas feed | `https://kalshi.com/ideas/feed` | logged out | `public/social-desktop.png` | Social is market-linked, but hydration above the fold is lighter than ideal |
| static/about | `https://kalshi.com/about` | logged out | `public/about-desktop.png` | Static pages still feel like part of a mature ecosystem |
| drawer | `https://kalshi.com/` | logged out | `public/drawer-desktop.png` | Desktop hamburger acts like a workstation affordance rather than a mobile fallback |

## Public market detail

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| market detail | `https://kalshi.com/markets/kxnbagame/professional-basketball-game/kxnbagame-26mar08nyklal` | logged out | `public/market-detail-desktop.png`, `public/market-detail-mobile.png` | Left-context and right-action composition is the clearest product benchmark |
| legal/static | `https://kalshi.com/faq`, `https://kalshi.com/regulatory/agreement` | logged out | no screenshots saved | Titles remain literal and route-specific |

## Public docs and help

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| api docs landing | `https://docs.kalshi.com/welcome` | logged out | `docs/api-welcome-desktop.png` | Mature docs shell with search, left nav, and on-page navigation |
| api quick start | `https://docs.kalshi.com/getting_started/quick_start_create_order` | logged out | `docs/api-create-order-desktop.png`, `docs/api-create-order-mobile.png` | Strong operational tone and mobile-capable docs layout |
| help center | `https://help.kalshi.com` | logged out | `docs/help-center-home-desktop.png` | Softer support-specific styling while staying product-adjacent |
| fees help | `https://help.kalshi.com/trading/fees` | logged out | no screenshot saved | Fee explanation is short, procedural, and tied directly to the order ticket UI |
| referral help | `https://help.kalshi.com/account/signing-up/signing-up-as-an-individual/referral-faqs` | logged out | no screenshot saved | Reward mechanics, limits, and withdrawal restrictions are handled as account terms, not promo copy |
| risk controls help | `https://help.kalshi.com/account/responsible-risk-management` | logged out | no screenshot saved | Sensitive account settings are documented with plain, low-drama support copy |

## Authenticated discovery and account

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| authenticated home | `https://kalshi.com/` | authenticated | `auth/home-desktop.png` | Discovery still dominates after login; product does not turn into a dashboard |
| account menu | home shell | authenticated | `auth/account-menu-desktop.png` | Lightweight account IA instead of heavy nav chrome |
| portfolio | `https://kalshi.com/portfolio` | authenticated | `auth/portfolio-desktop.png` | Dense but legible balance and position surface |
| profile | `https://kalshi.com/account/profile` | authenticated | `auth/account-security-desktop.png` | Account and security route stays structurally clean |
| activity | `https://kalshi.com/account/activity` | authenticated | `auth/activity-desktop.png` | Clear activity log with same shell continuity |
| transfers | `https://kalshi.com/account/banking` | authenticated | `auth/transfers-desktop.png` | Operational route stays consistent with auth shell |
| documents | `https://kalshi.com/account/taxes` | authenticated | `auth/documents-desktop.png` | Documents route remains minimal and direct |
| settings | `https://kalshi.com/account/settings` | authenticated | `auth/settings-desktop.png` | Settings is intentionally restrained and long-form |

## Themes and interaction states

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| settings dark mode | `https://kalshi.com/account/settings` | authenticated dark | `themes/settings-dark-desktop.png` | Theme preference persists, but dark mode flattens some hierarchy |
| authenticated home dark | `https://kalshi.com/` | authenticated dark | `themes/home-dark-desktop.png` | Dark board remains readable but loses some depth compared with light mode |
| settings light restored | `https://kalshi.com/account/settings` | authenticated light | `themes/settings-restored-light-desktop.png` | Original light theme was restored after the rerun; hierarchy reads stronger than dark mode |
| authenticated home light restored | `https://kalshi.com/` | authenticated light | `themes/home-restored-light-desktop.png` | Grouped shelves separate more clearly in light mode |
| search focus | home shell | authenticated | `auth/search-results-desktop.png` | Search is fast, direct, and market-linked with `Markets` and `Profiles` tabs |
| drawer | home shell | authenticated | `auth/drawer-open-desktop.png` | Drawer becomes a positions and watchlist workspace without discarding the board |

## Authenticated trading

| Route family | Route | State | Artifacts | Findings |
| --- | --- | --- | --- | --- |
| market detail with ticket | `https://kalshi.com/markets/kxsenatetxr/texas-republican-senate-nominee/kxsenatetxr-26` | authenticated | `auth/market-detail-desktop.png` | Strong left-context / right-ticket composition with visible rules and social |
| review state | same route | authenticated dark | `orders/review-order-dark-desktop.png` | Ticket compresses cost, odds, and payout into a high-confidence final review step |
| order confirmation | same route | authenticated dark | `orders/order-submitted-dark-desktop.png` | Confirmation state is compact and immediately returns the user to a live position-aware market detail |
| sell review | same route | authenticated dark | `orders/review-sell-dark-desktop.png` | Sell flow preloads the held position and makes full exit straightforward |
| sell confirmation | same route | authenticated dark | `orders/order-closed-dark-desktop.png` | Close-out summary makes the realized loss and payout explicit without leaving the route |
| portfolio after close | `https://kalshi.com/portfolio` | authenticated dark | `orders/portfolio-after-close-dark-desktop.png` | Portfolio cleared back to cash quickly and showed `No open positions` after the close-out |
| activity after trades | `https://kalshi.com/account/activity` | authenticated dark | `orders/activity-after-trades-dark-desktop.png` | Activity recorded both `Order Filled` and `Trade completed` entries for buy and sell at the expected timestamps |
| console noise | same route | authenticated dark | `orders/market-detail-console.log`, `orders/market-detail-network.log` | Websocket, Statsig, pixel, attribution, and request noise remain visible during use |

## Completed order lifecycle

- buy submitted on `Texas Republican Senate nominee?` for `Buy Yes · John Cornyn`
- estimated buy cost confirmed at `$0.81`
- sell submitted for the full `1` contract position
- sell payout confirmed at `$0.76`
- total lifecycle impact confirmed at `-$0.05`
- account theme restored to light mode after the benchmark
