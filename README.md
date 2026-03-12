# PayToCommit

PayToCommit is a web-first public beta for proof-backed commitment pools. This repo contains the marketing site, the `/app` product shell, mock-backed API contracts, and a Supabase schema scaffold for the production data model.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4 with a custom neon-glass interface
- Supabase client helpers and SQL migration scaffold
- Stripe and Resend integration surfaces
- Netlify deployment config

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in local values:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Run checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Important Routes

- `/` marketing home
- `/pools` public pool browser
- `/spark` public activity layer
- `/leaderboard` reliability board
- `/developers` and `/developers/api` developer surfaces
- `/network` Commitment Network ledger
- `/app` product shell
- `/app/admin` staff preview

## Supabase

The initial SQL lives in `supabase/migrations/20260308160000_paytocommit_public_beta.sql`. It covers profiles, onboarding, commitment pools, participations, proof packets, settlement decisions, reliability profiles, consent grants, API keys, ledger entries, and notifications.

## Deployment

Netlify is configured via `netlify.toml`. Once environment variables are loaded into Netlify and Supabase, the repo is ready for preview and production deployment.

Production site lock:

- Netlify site: `paytocommit-full-website-app`
- Netlify site ID: `f79cfff3-186b-4b83-aa09-dd7e7d08913d`
- Production domain: `https://paytocommit.com`
- GitHub remote: `https://github.com/rumizenzz/paytocommit-full-platform.git`

Run this before any local Netlify deploy or relink:

```bash
npm run netlify:verify
```
