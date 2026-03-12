alter table public.profiles
  add column if not exists identity_status text not null default 'not_started',
  add column if not exists identity_full_name text,
  add column if not exists identity_birth_date date,
  add column if not exists identity_country text,
  add column if not exists identity_verified_at timestamptz;

update public.profiles
set identity_status = coalesce(identity_status, 'not_started')
where identity_status is null;
