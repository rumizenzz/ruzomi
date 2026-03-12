create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.commitment_pools
  add column if not exists target_goal text not null default '',
  add column if not exists stake_band_label text,
  add column if not exists result_state text not null default 'Successful entrants recover their stake and split the forfeited side after fees.',
  add column if not exists network_state text not null default 'Stake, proof, and result entries publish to the Commitment Network.',
  add column if not exists payout_label text not null default 'Settles after proof review.',
  add column if not exists trend_label text not null default 'Holding steady',
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists featured boolean not null default true,
  add column if not exists chain_eligible boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists commitment_pools_touch_updated_at on public.commitment_pools;
create trigger commitment_pools_touch_updated_at
before update on public.commitment_pools
for each row
execute function public.touch_updated_at();

alter table public.proof_packets
  alter column participation_id drop not null;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  session_token text not null unique,
  display_name text not null,
  handle text not null unique,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null unique references public.app_users(id) on delete cascade,
  currency text not null default 'USD',
  available_cents integer not null default 0,
  pending_cents integer not null default 0,
  locked_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  type text not null,
  status text not null default 'pending',
  amount_cents integer not null,
  fee_cents integer not null default 0,
  net_cents integer not null default 0,
  summary text not null,
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_holds (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pool_id uuid references public.commitment_pools(id) on delete cascade,
  amount_cents integer not null,
  status text not null default 'held',
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create table if not exists public.pool_stats (
  pool_id uuid primary key references public.commitment_pools(id) on delete cascade,
  participant_count integer not null default 0,
  ticket_count integer not null default 0,
  total_staked_cents integer not null default 0,
  completed_count integer not null default 0,
  missed_count integer not null default 0,
  message_count integer not null default 0,
  live_total_visible boolean not null default false,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.pool_tickets (
  id uuid primary key default gen_random_uuid(),
  seed_key text unique,
  pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  stake_cents integer not null,
  contract_fee_cents integer not null default 50,
  status text not null default 'active',
  proof_status text not null default 'pending',
  result_status text not null default 'active',
  proof_due_at timestamptz,
  joined_at timestamptz not null default now(),
  settled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.pool_ticket_settlements (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.pool_tickets(id) on delete cascade,
  gross_payout_cents integer not null default 0,
  platform_capture_cents integer not null default 0,
  result_status text not null,
  settled_at timestamptz not null default now()
);

alter table public.proof_packets
  add column if not exists ticket_id uuid references public.pool_tickets(id) on delete cascade;

create table if not exists public.chains (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  category text not null,
  status text not null default 'live',
  primary_pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  secondary_pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  stake_min_cents integer not null default 1000,
  stake_max_cents integer not null default 10000,
  assembly_fee_cents integer not null default 100,
  payout_label text not null default 'Both legs must close clean.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (primary_pool_id <> secondary_pool_id)
);

create table if not exists public.chain_tickets (
  id uuid primary key default gen_random_uuid(),
  seed_key text unique,
  chain_id uuid not null references public.chains(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  stake_cents integer not null,
  assembly_fee_cents integer not null default 100,
  status text not null default 'active',
  result_status text not null default 'active',
  joined_at timestamptz not null default now()
);

create table if not exists public.chain_settlements (
  id uuid primary key default gen_random_uuid(),
  chain_ticket_id uuid not null unique references public.chain_tickets(id) on delete cascade,
  gross_payout_cents integer not null default 0,
  platform_capture_cents integer not null default 0,
  result_status text not null,
  settled_at timestamptz not null default now()
);

create table if not exists public.pool_messages (
  id uuid primary key default gen_random_uuid(),
  seed_key text unique,
  pool_id uuid references public.commitment_pools(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  body text not null,
  tenor_gif_url text,
  moderation_state text not null default 'visible',
  created_at timestamptz not null default now()
);

create table if not exists public.pool_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.pool_messages(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  body text not null,
  tenor_gif_url text,
  moderation_state text not null default 'visible',
  created_at timestamptz not null default now()
);

create table if not exists public.pool_message_reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  reaction text not null default 'heart',
  created_at timestamptz not null default now(),
  unique (target_type, target_id, app_user_id, reaction)
);

create table if not exists public.pool_message_reads (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  unique (pool_id, app_user_id)
);

create table if not exists public.reliability_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.app_users(id) on delete cascade,
  invited_user_id uuid not null references public.app_users(id) on delete cascade,
  successful_stakes integer not null default 0,
  required_stakes integer not null default 3,
  fees_captured_cents integer not null default 0,
  payout_unlocked boolean not null default false,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (referrer_user_id, invited_user_id)
);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  summary text not null,
  tone text not null default 'live',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

drop trigger if exists app_users_touch_updated_at on public.app_users;
create trigger app_users_touch_updated_at
before update on public.app_users
for each row
execute function public.touch_updated_at();

drop trigger if exists wallet_accounts_touch_updated_at on public.wallet_accounts;
create trigger wallet_accounts_touch_updated_at
before update on public.wallet_accounts
for each row
execute function public.touch_updated_at();

drop trigger if exists pool_stats_touch_updated_at on public.pool_stats;
create trigger pool_stats_touch_updated_at
before update on public.pool_stats
for each row
execute function public.touch_updated_at();

drop trigger if exists chains_touch_updated_at on public.chains;
create trigger chains_touch_updated_at
before update on public.chains
for each row
execute function public.touch_updated_at();

create or replace function public.refresh_pool_stats_for_pool(target_pool_id uuid)
returns void
language plpgsql
as $$
declare
  next_participant_count integer;
  next_ticket_count integer;
  next_total_cents integer;
  next_completed_count integer;
  next_missed_count integer;
  next_message_count integer;
  next_last_activity timestamptz;
begin
  select
    count(distinct t.app_user_id),
    count(*),
    coalesce(sum(t.stake_cents), 0),
    count(*) filter (where t.result_status = 'completed'),
    count(*) filter (where t.result_status = 'missed'),
    coalesce(
      (
        select count(*)
        from public.pool_messages m
        where m.pool_id = target_pool_id
          and m.moderation_state = 'visible'
      ),
      0
    ),
    greatest(
      coalesce(max(t.joined_at), to_timestamp(0)),
      coalesce(
        (
          select max(m.created_at)
          from public.pool_messages m
          where m.pool_id = target_pool_id
        ),
        to_timestamp(0)
      )
    )
  into
    next_participant_count,
    next_ticket_count,
    next_total_cents,
    next_completed_count,
    next_missed_count,
    next_message_count,
    next_last_activity
  from public.pool_tickets t
  where t.pool_id = target_pool_id;

  insert into public.pool_stats (
    pool_id,
    participant_count,
    ticket_count,
    total_staked_cents,
    completed_count,
    missed_count,
    message_count,
    live_total_visible,
    last_activity_at
  )
  values (
    target_pool_id,
    coalesce(next_participant_count, 0),
    coalesce(next_ticket_count, 0),
    coalesce(next_total_cents, 0),
    coalesce(next_completed_count, 0),
    coalesce(next_missed_count, 0),
    coalesce(next_message_count, 0),
    coalesce(next_total_cents, 0) > 0,
    nullif(next_last_activity, to_timestamp(0))
  )
  on conflict (pool_id) do update
  set
    participant_count = excluded.participant_count,
    ticket_count = excluded.ticket_count,
    total_staked_cents = excluded.total_staked_cents,
    completed_count = excluded.completed_count,
    missed_count = excluded.missed_count,
    message_count = excluded.message_count,
    live_total_visible = excluded.live_total_visible,
    last_activity_at = excluded.last_activity_at,
    updated_at = now();
end;
$$;

create or replace function public.refresh_pool_stats_trigger()
returns trigger
language plpgsql
as $$
declare
  target_pool_id uuid;
begin
  target_pool_id = coalesce(new.pool_id, old.pool_id);
  if target_pool_id is not null then
    perform public.refresh_pool_stats_for_pool(target_pool_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists pool_tickets_refresh_pool_stats on public.pool_tickets;
create trigger pool_tickets_refresh_pool_stats
after insert or update or delete on public.pool_tickets
for each row
execute function public.refresh_pool_stats_trigger();

drop trigger if exists pool_messages_refresh_pool_stats on public.pool_messages;
create trigger pool_messages_refresh_pool_stats
after insert or update or delete on public.pool_messages
for each row
execute function public.refresh_pool_stats_trigger();

alter table public.app_users enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.wallet_holds enable row level security;
alter table public.pool_stats enable row level security;
alter table public.pool_tickets enable row level security;
alter table public.pool_ticket_settlements enable row level security;
alter table public.chains enable row level security;
alter table public.chain_tickets enable row level security;
alter table public.chain_settlements enable row level security;
alter table public.pool_messages enable row level security;
alter table public.pool_message_replies enable row level security;
alter table public.pool_message_reactions enable row level security;
alter table public.pool_message_reads enable row level security;
alter table public.reliability_rewards enable row level security;
alter table public.app_notifications enable row level security;

create policy "pool stats public read"
on public.pool_stats for select using (true);

create policy "chains public read"
on public.chains for select using (true);

create policy "chain settlements public read"
on public.chain_settlements for select using (true);

create policy "pool messages public read"
on public.pool_messages for select using (moderation_state = 'visible');

create policy "pool message replies public read"
on public.pool_message_replies for select using (moderation_state = 'visible');

create policy "pool message reactions public read"
on public.pool_message_reactions for select using (true);

do $$
begin
  begin
    alter publication supabase_realtime add table public.commitment_pools;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.pool_stats;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.pool_messages;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.pool_message_replies;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.pool_message_reactions;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.pool_tickets;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.wallet_accounts;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.app_notifications;
  exception
    when duplicate_object then null;
  end;
end;
$$;

insert into public.app_users (session_token, display_name, handle)
values
  ('seed-alex-j', 'Alex J', 'alex_j'),
  ('seed-sarah-k', 'Sarah K', 'sarah_k'),
  ('seed-noah-r', 'Noah R', 'noah_r'),
  ('seed-mia-l', 'Mia L', 'mia_l'),
  ('seed-jordan-p', 'Jordan P', 'jordan_p'),
  ('seed-elena-v', 'Elena V', 'elena_v')
on conflict (session_token) do nothing;

insert into public.wallet_accounts (app_user_id, available_cents, pending_cents, locked_cents)
select u.id, 4000, 0, 0
from public.app_users u
left join public.wallet_accounts w on w.app_user_id = u.id
where u.session_token like 'seed-%'
  and w.id is null;

insert into public.commitment_pools (
  slug,
  title,
  category,
  summary,
  status,
  stake_min_cents,
  stake_max_cents,
  proof_mode,
  rules,
  opens_at,
  closes_at,
  resolves_at,
  proof_window_minutes,
  challenge_window_minutes,
  target_goal,
  stake_band_label,
  result_state,
  network_state,
  payout_label,
  trend_label,
  tags,
  featured,
  chain_eligible
)
values
  (
    'run-5k-before-sunrise',
    'Run 5K Before Sunrise',
    'Fitness',
    'Commit to a clean 5K before the day starts. GPS proof or treadmill export is required before review opens.',
    'live',
    2500,
    25000,
    'GPS, treadmill export, or verified coach upload',
    '["Distance must be logged in one continuous session.","Late proof is marked missed unless PayToCommit confirms a site incident.","Visible splits are required for manual uploads."]'::jsonb,
    now() - interval '1 day',
    now() + interval '14 hours',
    now() + interval '15 hours',
    60,
    360,
    'Finish the full 5K inside one tracked effort before the deadline closes.',
    '$25 to $250',
    'Completed runners recover stake and split the forfeited side after fees.',
    'Stake, proof, and result events publish live to the Commitment Network.',
    'Settles the same morning after review.',
    '+18% this week',
    '["morning","verified proof","popular"]'::jsonb,
    true,
    true
  ),
  (
    'ten-thousand-steps-before-midnight',
    '10,000 Steps Before Midnight',
    'Fitness',
    'Track the full day and cross the line before the clock resets. Device proof closes the pool.',
    'live',
    1000,
    12000,
    'Apple Health, Fitbit, Garmin, or approved step export',
    '["Step totals must be captured after the end-of-day lock.","Edited screenshots are rejected.","Manual conversions from distance logs are not accepted."]'::jsonb,
    now() - interval '12 hours',
    date_trunc('day', now()) + interval '1 day' - interval '1 minute',
    date_trunc('day', now()) + interval '1 day' + interval '1 hour',
    45,
    360,
    'Hit 10,000 verified steps before the day closes.',
    '$10 to $120',
    'Completed walkers recover stake and split the forfeited side after fees.',
    'Fast device proof routes into the Commitment Network as soon as review opens.',
    'Device proof routes to fast review.',
    '+27% this week',
    '["daily","device proof","high volume"]'::jsonb,
    true,
    true
  ),
  (
    'wash-the-dishes-before-eight',
    'Wash Every Dish Before 8:00 PM',
    'Home',
    'Put a hard deadline on the cleanup. Kitchen photo proof, sink clear-down, and finish timestamp are required.',
    'live',
    1000,
    4000,
    'Before-and-after kitchen photos with timestamp overlay',
    '["All visible dishes, pans, and utensils must be cleaned and stored.","Counter and sink must be visible in the finish proof.","Proof taken before the pool opens is invalid."]'::jsonb,
    now() - interval '8 hours',
    date_trunc('day', now()) + interval '20 hours',
    date_trunc('day', now()) + interval '21 hours' + interval '15 minutes',
    30,
    180,
    'Clear every visible dish before 8:00 PM local deadline.',
    '$10 to $40',
    'Completed kitchens recover stake and split the forfeited side after fees.',
    'Kitchen proof, fee capture, and result events publish live.',
    'Settles after visual review.',
    '+42% this week',
    '["home","short window","popular"]'::jsonb,
    true,
    true
  ),
  (
    'inbox-zero-before-noon',
    'Inbox Zero Before Noon',
    'Work',
    'Clear the backlog, archive what is done, and finish with a visible zero-state before lunch.',
    'live',
    1500,
    15000,
    'Inbox screenshot or exported mail status',
    '["Primary inbox must show zero unread and zero pending.","Snoozed mail counts as unresolved.","Manual cropping that hides timestamps is invalid."]'::jsonb,
    now() - interval '5 hours',
    date_trunc('day', now()) + interval '12 hours',
    date_trunc('day', now()) + interval '13 hours' + interval '30 minutes',
    20,
    240,
    'Clear the primary inbox to a visible zero state before noon.',
    '$15 to $150',
    'Completed desks recover stake and split the forfeited side after fees.',
    'Inbox proof, review, and payout state publish live.',
    'Closes with quick proof review.',
    '+14% this morning',
    '["focus","office","same-day"]'::jsonb,
    true,
    true
  ),
  (
    'ship-the-feature-by-friday',
    'Ship the Feature by Friday',
    'Work',
    'Attach the repo, publish the deploy preview, and close the scope before the Friday cutoff hits.',
    'live',
    5000,
    50000,
    'Git commit, deploy preview, and changelog receipt',
    '["A visible deploy preview is required.","Proof must include linked release notes or a completed task receipt.","Broken builds are not considered shipped."]'::jsonb,
    now() - interval '2 days',
    date_trunc('week', now()) + interval '5 days' + interval '17 hours',
    date_trunc('week', now()) + interval '5 days' + interval '20 hours' + interval '30 minutes',
    90,
    720,
    'Close the scoped feature with a live deploy preview by Friday afternoon.',
    '$50 to $500',
    'Completed shippers recover stake and split the forfeited side after fees.',
    'Deploy, proof, challenge, and payout events publish live.',
    'Settles after staff review.',
    '+9% this week',
    '["builders","deploy proof","high stakes"]'::jsonb,
    true,
    true
  ),
  (
    'call-your-parents-before-nine',
    'Call Your Parents Before 9:00 PM',
    'Relationships',
    'A small promise with a real deadline. Call logs or verified voice receipts lock the result.',
    'live',
    1000,
    7500,
    'Call log, screen recording, or approved voice receipt',
    '["Missed calls do not count.","The proof must show the call happened inside the pool window.","Blocked-contact labels are not accepted for review."]'::jsonb,
    now() - interval '8 hours',
    date_trunc('day', now()) + interval '21 hours',
    date_trunc('day', now()) + interval '22 hours',
    25,
    180,
    'Complete one real call with timestamped proof before 9:00 PM.',
    '$10 to $75',
    'Completed callers recover stake and split the forfeited side after fees.',
    'Call proof and result events publish as soon as review closes.',
    'Short review cycle.',
    '+11% this week',
    '["social","family","short deadline"]'::jsonb,
    true,
    true
  ),
  (
    'read-100-pages-this-week',
    'Read 100 Pages This Week',
    'Learning',
    'Track reading across one or more sessions and finish the full target before the weekly close.',
    'upcoming',
    1000,
    10000,
    'Reading tracker, photo proof, or verified study group note',
    '["Only pages completed inside the pool window count.","Audio books require minute conversion receipts.","Manual submissions must include timestamped progress snapshots."]'::jsonb,
    date_trunc('week', now()) + interval '1 day',
    date_trunc('week', now()) + interval '7 days' + interval '22 hours',
    date_trunc('week', now()) + interval '7 days' + interval '23 hours',
    120,
    720,
    'Finish the full 100-page target before the weekly close.',
    '$10 to $100',
    'Completed readers recover stake and split the forfeited side after fees.',
    'Rules are locked. The first paid join opens the total.',
    'Opens next cycle.',
    '+31% watchlist growth',
    '["study","weekly","group favorite"]'::jsonb,
    true,
    true
  ),
  (
    'zero-sugar-seven-days',
    'Zero Sugar for Seven Days',
    'Health',
    'One week, no sugary drinks or desserts. Receipt checks and daily check-ins lock the result.',
    'settling',
    2000,
    15000,
    'Receipt snapshots and daily streak confirmations',
    '["Staff reviews flagged ingredient lists.","Only approved substitutions count.","Missed daily check-in triggers manual review."]'::jsonb,
    now() - interval '8 days',
    now() - interval '1 day',
    now() + interval '4 hours',
    0,
    240,
    'Clear the full seven-day window with verified compliance.',
    '$20 to $150',
    'Completed entrants recover stake and split the forfeited side after fees.',
    'Rulings and fee capture are moving through the Commitment Network.',
    'Ruling in progress.',
    '18 active disputes',
    '["wellness","review live","discipline"]'::jsonb,
    true,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  status = excluded.status,
  stake_min_cents = excluded.stake_min_cents,
  stake_max_cents = excluded.stake_max_cents,
  proof_mode = excluded.proof_mode,
  rules = excluded.rules,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  resolves_at = excluded.resolves_at,
  proof_window_minutes = excluded.proof_window_minutes,
  challenge_window_minutes = excluded.challenge_window_minutes,
  target_goal = excluded.target_goal,
  stake_band_label = excluded.stake_band_label,
  result_state = excluded.result_state,
  network_state = excluded.network_state,
  payout_label = excluded.payout_label,
  trend_label = excluded.trend_label,
  tags = excluded.tags,
  featured = excluded.featured,
  chain_eligible = excluded.chain_eligible,
  updated_at = now();

insert into public.chains (
  slug,
  title,
  summary,
  category,
  status,
  primary_pool_id,
  secondary_pool_id,
  stake_min_cents,
  stake_max_cents,
  assembly_fee_cents,
  payout_label
)
select
  'sunrise-fitness-chain',
  'Sunrise Fitness Chain',
  'Link the sunrise run and the daily step target. Both legs must finish clean or the Chain fails.',
  'Fitness',
  'live',
  run_pool.id,
  steps_pool.id,
  3000,
  30000,
  150,
  'Both legs must close clean for the Chain to pay.'
from public.commitment_pools run_pool
join public.commitment_pools steps_pool on steps_pool.slug = 'ten-thousand-steps-before-midnight'
where run_pool.slug = 'run-5k-before-sunrise'
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  category = excluded.category,
  status = excluded.status,
  primary_pool_id = excluded.primary_pool_id,
  secondary_pool_id = excluded.secondary_pool_id,
  stake_min_cents = excluded.stake_min_cents,
  stake_max_cents = excluded.stake_max_cents,
  assembly_fee_cents = excluded.assembly_fee_cents,
  payout_label = excluded.payout_label,
  updated_at = now();

insert into public.chains (
  slug,
  title,
  summary,
  category,
  status,
  primary_pool_id,
  secondary_pool_id,
  stake_min_cents,
  stake_max_cents,
  assembly_fee_cents,
  payout_label
)
select
  'workday-close-chain',
  'Workday Close Chain',
  'Clear the inbox and ship the scoped feature. Miss either leg and the Chain closes missed.',
  'Work',
  'live',
  inbox_pool.id,
  ship_pool.id,
  4000,
  40000,
  150,
  'Both work legs must resolve completed for the Chain to pay.'
from public.commitment_pools inbox_pool
join public.commitment_pools ship_pool on ship_pool.slug = 'ship-the-feature-by-friday'
where inbox_pool.slug = 'inbox-zero-before-noon'
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  category = excluded.category,
  status = excluded.status,
  primary_pool_id = excluded.primary_pool_id,
  secondary_pool_id = excluded.secondary_pool_id,
  stake_min_cents = excluded.stake_min_cents,
  stake_max_cents = excluded.stake_max_cents,
  assembly_fee_cents = excluded.assembly_fee_cents,
  payout_label = excluded.payout_label,
  updated_at = now();

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'run-5k-alex',
  p.id,
  u.id,
  w.id,
  5000,
  50,
  'active',
  'pending',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '3 hours',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-alex-j'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'run-5k-before-sunrise'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'run-5k-sarah',
  p.id,
  u.id,
  w.id,
  7500,
  50,
  'active',
  'submitted',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '2 hours',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-sarah-k'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'run-5k-before-sunrise'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'steps-noah',
  p.id,
  u.id,
  w.id,
  3500,
  50,
  'active',
  'pending',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '5 hours',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-noah-r'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'ten-thousand-steps-before-midnight'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'dishes-mia',
  p.id,
  u.id,
  w.id,
  2000,
  50,
  'active',
  'pending',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '1 hour',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-mia-l'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'wash-the-dishes-before-eight'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'dishes-jordan',
  p.id,
  u.id,
  w.id,
  3000,
  50,
  'active',
  'submitted',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '30 minutes',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-jordan-p'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'wash-the-dishes-before-eight'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, metadata)
select
  'inbox-elena',
  p.id,
  u.id,
  w.id,
  4500,
  50,
  'active',
  'submitted',
  'active',
  p.closes_at + make_interval(mins => p.proof_window_minutes),
  now() - interval '90 minutes',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-elena-v'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'inbox-zero-before-noon'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, settled_at, metadata)
select
  'zero-sugar-alex',
  p.id,
  u.id,
  w.id,
  4000,
  50,
  'settled',
  'approved',
  'completed',
  p.closes_at,
  now() - interval '8 days',
  now() - interval '30 minutes',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-alex-j'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'zero-sugar-seven-days'
on conflict (seed_key) do nothing;

insert into public.pool_tickets (seed_key, pool_id, app_user_id, wallet_account_id, stake_cents, contract_fee_cents, status, proof_status, result_status, proof_due_at, joined_at, settled_at, metadata)
select
  'zero-sugar-noah',
  p.id,
  u.id,
  w.id,
  4000,
  50,
  'settled',
  'rejected',
  'missed',
  p.closes_at,
  now() - interval '8 days',
  now() - interval '25 minutes',
  '{"source":"seed"}'::jsonb
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-noah-r'
join public.wallet_accounts w on w.app_user_id = u.id
where p.slug = 'zero-sugar-seven-days'
on conflict (seed_key) do nothing;

insert into public.chain_tickets (seed_key, chain_id, app_user_id, wallet_account_id, stake_cents, assembly_fee_cents, status, result_status, joined_at)
select
  'sunrise-chain-alex',
  c.id,
  u.id,
  w.id,
  6000,
  150,
  'active',
  'active',
  now() - interval '2 hours'
from public.chains c
join public.app_users u on u.session_token = 'seed-alex-j'
join public.wallet_accounts w on w.app_user_id = u.id
where c.slug = 'sunrise-fitness-chain'
on conflict (seed_key) do nothing;

insert into public.pool_messages (seed_key, pool_id, app_user_id, body, tenor_gif_url)
select
  'spark-run-1',
  p.id,
  u.id,
  'Sunrise route is locked in. Proof goes up the second I cross the line.',
  null
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-sarah-k'
where p.slug = 'run-5k-before-sunrise'
on conflict (seed_key) do nothing;

insert into public.pool_messages (seed_key, pool_id, app_user_id, body, tenor_gif_url)
select
  'spark-dishes-1',
  p.id,
  u.id,
  'Kitchen is halfway there. Sink is clear, pans are next.',
  'https://media.tenor.com/7pXG8M4d8r4AAAAC/cleaning-dishes.gif'
from public.commitment_pools p
join public.app_users u on u.session_token = 'seed-mia-l'
where p.slug = 'wash-the-dishes-before-eight'
on conflict (seed_key) do nothing;

insert into public.pool_messages (seed_key, pool_id, app_user_id, body, tenor_gif_url)
select
  'spark-global-1',
  null,
  u.id,
  'Sunrise Fitness Chain is filling faster than the single-leg board this morning.',
  null
from public.app_users u
where u.session_token = 'seed-jordan-p'
on conflict (seed_key) do nothing;

insert into public.app_notifications (app_user_id, title, summary, tone)
select
  u.id,
  'Proof window open',
  'Run 5K Before Sunrise is now accepting proof.',
  'live'
from public.app_users u
where u.session_token = 'seed-alex-j'
  and not exists (
    select 1
    from public.app_notifications n
    where n.app_user_id = u.id
      and n.title = 'Proof window open'
      and n.summary = 'Run 5K Before Sunrise is now accepting proof.'
  );

insert into public.reliability_rewards (
  referrer_user_id,
  invited_user_id,
  successful_stakes,
  required_stakes,
  fees_captured_cents,
  payout_unlocked
)
select
  referrer.id,
  invited.id,
  2,
  3,
  850,
  false
from public.app_users referrer
join public.app_users invited on invited.session_token = 'seed-noah-r'
where referrer.session_token = 'seed-alex-j'
on conflict (referrer_user_id, invited_user_id) do update
set
  successful_stakes = excluded.successful_stakes,
  required_stakes = excluded.required_stakes,
  fees_captured_cents = excluded.fees_captured_cents,
  payout_unlocked = excluded.payout_unlocked;

insert into public.network_ledger_entries (pool_id, event_type, payload)
select
  p.id,
  'stake_placed',
  jsonb_build_object('summary', 'Wallet cash moved into a live ticket.', 'amount_cents', 5000, 'status', 'posted')
from public.commitment_pools p
where p.slug = 'run-5k-before-sunrise'
  and not exists (
    select 1
    from public.network_ledger_entries e
    where e.pool_id = p.id
      and e.event_type = 'stake_placed'
  );

insert into public.network_ledger_entries (pool_id, event_type, payload)
select
  p.id,
  'proof_submitted',
  jsonb_build_object('summary', 'Proof packet accepted for review.', 'status', 'submitted')
from public.commitment_pools p
where p.slug = 'wash-the-dishes-before-eight'
  and not exists (
    select 1
    from public.network_ledger_entries e
    where e.pool_id = p.id
      and e.event_type = 'proof_submitted'
  );

insert into public.network_ledger_entries (pool_id, event_type, payload)
select
  p.id,
  'payout_credited',
  jsonb_build_object('summary', 'Completed side credited after fee capture.', 'amount_cents', 7200, 'status', 'posted')
from public.commitment_pools p
where p.slug = 'zero-sugar-seven-days'
  and not exists (
    select 1
    from public.network_ledger_entries e
    where e.pool_id = p.id
      and e.event_type = 'payout_credited'
  );

insert into public.wallet_transactions (wallet_account_id, app_user_id, type, status, amount_cents, fee_cents, net_cents, summary, external_reference, metadata)
select
  w.id,
  u.id,
  'funding_posted',
  'posted',
  2000,
  50,
  1950,
  'Card top-up posted to wallet cash.',
  'seed-topup-alex',
  '{"source":"seed"}'::jsonb
from public.app_users u
join public.wallet_accounts w on w.app_user_id = u.id
where u.session_token = 'seed-alex-j'
  and not exists (
    select 1
    from public.wallet_transactions t
    where t.external_reference = 'seed-topup-alex'
  );

update public.wallet_accounts w
set available_cents = 2524
from public.app_users u
where w.app_user_id = u.id
  and u.session_token = 'seed-alex-j';

do $$
declare
  target_pool uuid;
begin
  for target_pool in select id from public.commitment_pools loop
    perform public.refresh_pool_stats_for_pool(target_pool);
  end loop;
end;
$$;
