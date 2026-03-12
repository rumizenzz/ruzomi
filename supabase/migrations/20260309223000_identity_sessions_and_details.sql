alter table public.profiles
  add column if not exists identity_address_line_1 text,
  add column if not exists identity_city text,
  add column if not exists identity_region text,
  add column if not exists identity_postal_code text,
  add column if not exists identity_failed_reason text,
  add column if not exists identity_stripe_session_id text,
  add column if not exists identity_stripe_verification_id text,
  add column if not exists identity_last_checked_at timestamptz;

create index if not exists profiles_identity_stripe_session_id_idx
  on public.profiles (identity_stripe_session_id)
  where identity_stripe_session_id is not null;

create index if not exists profiles_identity_stripe_verification_id_idx
  on public.profiles (identity_stripe_verification_id)
  where identity_stripe_verification_id is not null;
