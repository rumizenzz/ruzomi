create table if not exists public.public_profile_settings (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null unique references public.app_users(id) on delete cascade,
  headline text not null default 'Closing commitment markets in public.',
  home_base text not null default 'PayToCommit',
  visibility text not null default 'public',
  share_proof_artifacts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_market_drafts (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  prompt text not null,
  title text not null,
  category text not null,
  summary text not null,
  target_goal text not null,
  proof_mode text not null,
  stake_min_cents integer not null default 1000,
  stake_max_cents integer not null default 10000,
  closes_at timestamptz not null,
  resolves_at timestamptz not null,
  proof_window_minutes integer not null default 90,
  challenge_window_minutes integer not null default 240,
  rules jsonb not null default '[]'::jsonb,
  invalidation_cases jsonb not null default '[]'::jsonb,
  proof_checklist jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'drafted',
  created_pool_id uuid references public.commitment_pools(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_verification_jobs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.pool_tickets(id) on delete cascade,
  pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  proof_summary text not null,
  proof_links jsonb not null default '[]'::jsonb,
  outcome text not null default 'pending',
  confidence numeric(4,3) not null default 0,
  explanation text not null default '',
  model text not null default 'PayToCommit Verify',
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.ai_appeal_jobs (
  id uuid primary key default gen_random_uuid(),
  verification_job_id uuid not null references public.ai_verification_jobs(id) on delete cascade,
  ticket_id uuid not null references public.pool_tickets(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  appeal_reason text not null,
  outcome text not null default 'pending',
  confidence numeric(4,3) not null default 0,
  explanation text not null default '',
  model text not null default 'PayToCommit Verify',
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.result_cards (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.pool_tickets(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  card_type text not null,
  title text not null,
  subtitle text not null,
  summary text not null,
  net_result_cents integer not null default 0,
  created_at timestamptz not null default now()
);

drop trigger if exists public_profile_settings_touch_updated_at on public.public_profile_settings;
create trigger public_profile_settings_touch_updated_at
before update on public.public_profile_settings
for each row
execute function public.touch_updated_at();

drop trigger if exists ai_market_drafts_touch_updated_at on public.ai_market_drafts;
create trigger ai_market_drafts_touch_updated_at
before update on public.ai_market_drafts
for each row
execute function public.touch_updated_at();

alter table public.public_profile_settings enable row level security;
alter table public.ai_market_drafts enable row level security;
alter table public.ai_verification_jobs enable row level security;
alter table public.ai_appeal_jobs enable row level security;
alter table public.result_cards enable row level security;

create policy "public profiles public read"
on public.public_profile_settings for select using (visibility = 'public');

create policy "result cards public read"
on public.result_cards for select using (true);

insert into public.public_profile_settings (app_user_id, headline, home_base, visibility, share_proof_artifacts)
select
  u.id,
  case u.handle
    when 'alex_j' then 'Morning miles, clean closes, and public receipts.'
    when 'sarah_k' then 'Quiet streaks with visible finishes.'
    when 'noah_r' then 'Work commitments that close on time.'
    when 'mia_l' then 'Daily discipline with a visible ledger.'
    when 'jordan_p' then 'Fitness markets, habit loops, and live pressure.'
    else 'Closing commitment markets in public.'
  end,
  'PayToCommit',
  'public',
  false
from public.app_users u
left join public.public_profile_settings p on p.app_user_id = u.id
where p.id is null;
