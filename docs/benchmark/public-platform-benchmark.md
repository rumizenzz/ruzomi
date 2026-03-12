# Public Platform Benchmark

Date: March 12, 2026

## Scope

Public benchmark sweep completed across:

- Kalshi public home and pre-auth entry
- Discord public home and auth-entry surfaces
- Stripe public home and public product shell

Authenticated benchmarking remains limited to lawful, already-authorized benchmark sessions only. This document captures the public patterns that are still useful for PayToCommit and Ruzomi.

## Kalshi

### Strong patterns

- The shell feels operational immediately: `Markets`, `LIVE`, `Social`, search, balance, and auth all fit without turning into a marketing page.
- Category breadth stays visible near the top, which makes the product readable in seconds.
- Discovery is shelf-based and dense. Modules like `Trending`, `Top movers`, `New`, and `Highest volume` are short, literal, and scannable.
- Market cards keep title, timing, percentage context, volume, and related market count in one compact unit.
- Public login entry stays light: auth sits inside the existing shell instead of redirecting into a detached identity product.

### Weak patterns

- Public pages generate visible console noise from websocket, Statsig, and analytics layers.
- Market rows occasionally feel telemetry-heavy rather than calm.
- Density is strong, but the overall page can feel mechanically busy.

### Takeaways for PayToCommit

- Keep the operating-shell feel, not the telemetry noise.
- Preserve category orientation above the fold.
- Use short literal shelf labels instead of explanatory narration.
- Keep pre-auth entry lightweight and close to the board surface.

## Discord

### Strong patterns

- The public brand shell is simple and recognizable from the first second.
- Auth surfaces are compact and direct, with strong visual hierarchy and limited copy.
- The product identity is preserved even on signup and login surfaces.
- Background motion is restrained enough to feel alive without distracting from the form.

### Weak patterns

- Anti-abuse friction arrives hard. CAPTCHA and rate limiting can fully block evaluation and reduce momentum.
- Public auth surfaces are visually polished, but the overall signup flow becomes brittle when rate limits trigger.
- The public homepage still relies on broad marketing framing more than product-state clarity.

### Takeaways for Ruzomi

- Keep the auth frame compact, centered, and unmistakably product-native.
- Avoid oversized form copy and avoid making the auth shell feel heavier than the product shell.
- Build stronger graceful failure states than Discord does when abuse/rate limits trigger.
- Preserve strong iconography, but keep the product more market-native than generic chat-native.

## Stripe

### Strong patterns

- The public homepage is calm, premium, and operational without becoming visually cold.
- Navigation density is high, but the hierarchy stays readable.
- CTA structure is disciplined: one primary, one secondary, and clear product segmentation.
- The product family is obvious from the first screen: payments, billing, docs, and enterprise operations all connect cleanly.
- The developer and enterprise feel starts on the public site, not only after sign-in.

### Weak patterns

- Information density can become abstract for first-time users if they do not already understand the category.
- Some product lanes depend on prior familiarity with Stripe’s ecosystem language.

### Takeaways for PayToCommit

- Use Stripe as the benchmark for calm enterprise hierarchy.
- Keep quickstarts compact and high-signal.
- Make docs, platform workspace, billing, and reports feel like one system.
- Preserve premium density without relying on insider language.

## Cross-product lessons

- Strong products do not split into separate personalities between public, auth, docs, and enterprise.
- Auth should feel smaller and calmer than the main shell, but still belong to the same system.
- Compactness matters more than sheer visual spectacle.
- Shelf modules, short labels, and dense but readable cards outperform long explanatory hero copy.
- Production polish comes from consistency, not from faking maturity.

## Immediate PayToCommit / Ruzomi direction

- Keep refining the authenticated shell so it feels smaller, calmer, and more operational.
- Keep the developer and platform hosts aligned with the Stripe-level calm hierarchy.
- Keep Ruzomi’s auth and social shell compact and product-native rather than oversized or game-like.
- Keep Kalshi’s board density as a reference, but remove its telemetry and console-noise weakness.
