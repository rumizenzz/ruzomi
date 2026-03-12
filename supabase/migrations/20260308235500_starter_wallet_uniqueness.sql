delete from public.wallet_transactions
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by app_user_id, external_reference
        order by created_at asc, id asc
      ) as row_num
    from public.wallet_transactions
    where external_reference is not null
  ) dedupe
  where dedupe.row_num > 1
);

create unique index if not exists wallet_transactions_app_user_external_reference_key
on public.wallet_transactions (app_user_id, external_reference)
where external_reference is not null;
