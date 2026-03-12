alter table public.pool_messages
  add column if not exists message_type text not null default 'message',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.public_profile_settings
  add column if not exists presence_status text not null default 'online',
  add column if not exists custom_activity_text text,
  add column if not exists custom_activity_expires_at timestamptz;

update public.pool_messages
set metadata = coalesce(metadata, '{}'::jsonb)
where metadata is null;

update public.public_profile_settings
set presence_status = coalesce(nullif(presence_status, ''), 'online')
where presence_status is distinct from coalesce(nullif(presence_status, ''), 'online');
