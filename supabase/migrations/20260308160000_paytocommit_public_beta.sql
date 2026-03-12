create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  timezone text default 'UTC',
  onboarding_completed_at timestamptz,
  reliability_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_name text,
  primary_goal text,
  communication_preference text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.commitment_pools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null,
  status text not null default 'draft',
  stake_min_cents integer not null default 0,
  stake_max_cents integer not null default 0,
  proof_mode text not null,
  rules jsonb not null default '[]'::jsonb,
  opens_at timestamptz,
  closes_at timestamptz,
  resolves_at timestamptz,
  proof_window_minutes integer not null default 60,
  challenge_window_minutes integer not null default 360,
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.pool_participations (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stake_cents integer not null default 0,
  result_status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique (pool_id, user_id)
);

create table if not exists public.proof_packets (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null references public.pool_participations(id) on delete cascade,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  evidence jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  review_status text not null default 'pending'
);

create table if not exists public.review_decisions (
  id uuid primary key default gen_random_uuid(),
  proof_packet_id uuid not null references public.proof_packets(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  decision text not null,
  notes text,
  decided_at timestamptz not null default now()
);

create table if not exists public.reliability_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score numeric(5,2) not null default 0,
  verified_pools integer not null default 0,
  challenge_losses integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.consent_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_name text not null,
  scope text not null,
  status text not null default 'granted',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.developer_api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),
  app_name text not null,
  key_hash text not null,
  scope text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.network_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid references public.commitment_pools(id) on delete cascade,
  participation_id uuid references public.pool_participations(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null,
  tone text not null default 'live',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.commitment_pools enable row level security;
alter table public.pool_participations enable row level security;
alter table public.proof_packets enable row level security;
alter table public.review_decisions enable row level security;
alter table public.reliability_profiles enable row level security;
alter table public.consent_grants enable row level security;
alter table public.developer_api_keys enable row level security;
alter table public.network_ledger_entries enable row level security;
alter table public.notification_events enable row level security;

create policy "profiles are readable by owner"
on public.profiles for select using (auth.uid() = user_id);

create policy "profiles are writable by owner"
on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "onboarding is owner scoped"
on public.onboarding_responses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pools are public to read"
on public.commitment_pools for select using (true);

create policy "participants read own entries"
on public.pool_participations for select using (auth.uid() = user_id);

create policy "participants manage own entries"
on public.pool_participations for insert with check (auth.uid() = user_id);

create policy "proof packets read by submitter"
on public.proof_packets for select using (auth.uid() = submitted_by);

create policy "proof packets created by submitter"
on public.proof_packets for insert with check (auth.uid() = submitted_by);

create policy "reliability profile owner read"
on public.reliability_profiles for select using (auth.uid() = user_id);

create policy "consent grants owner scoped"
on public.consent_grants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "developer keys owner scoped"
on public.developer_api_keys for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

create policy "network ledger public read"
on public.network_ledger_entries for select using (true);

create policy "notifications owner scoped"
on public.notification_events for select using (auth.uid() = user_id);
