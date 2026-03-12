alter table public.commitment_pools
  add column if not exists join_opens_at timestamptz,
  add column if not exists join_closes_at timestamptz;

update public.commitment_pools
set
  join_opens_at = coalesce(join_opens_at, opens_at),
  join_closes_at = coalesce(join_closes_at, closes_at)
where join_opens_at is null
   or join_closes_at is null;
