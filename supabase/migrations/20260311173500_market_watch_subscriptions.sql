create table if not exists public.market_watch_subscriptions (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pool_id uuid not null references public.commitment_pools(id) on delete cascade,
  active boolean not null default true,
  channels text[] not null default array['push', 'email', 'in_app']::text[],
  events text[] not null default array['market_open', 'join_closing_soon', 'last_call']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_user_id, pool_id)
);

drop trigger if exists market_watch_subscriptions_touch_updated_at on public.market_watch_subscriptions;
create trigger market_watch_subscriptions_touch_updated_at
before update on public.market_watch_subscriptions
for each row
execute function public.touch_updated_at();
