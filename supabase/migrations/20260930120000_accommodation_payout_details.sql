create table public.accommodation_payout_details (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bank_name text not null check (char_length(btrim(bank_name)) between 2 and 100),
  account_name text not null check (char_length(btrim(account_name)) between 2 and 100),
  account_number text not null check (account_number ~ '^[0-9]{6,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accommodation_payout_details enable row level security;

create or replace function public.is_accommodation_payout_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = (select auth.uid())
      and role in ('super_admin', 'admin')
  );
$$;

revoke all on function public.is_accommodation_payout_admin() from public;
revoke all on function public.is_accommodation_payout_admin() from anon;
grant execute on function public.is_accommodation_payout_admin() to authenticated;

revoke all on table public.accommodation_payout_details from anon, public;
grant select, insert, update on table public.accommodation_payout_details to authenticated;

create policy "Users can read their own accommodation payout details"
  on public.accommodation_payout_details
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own accommodation payout details"
  on public.accommodation_payout_details
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own accommodation payout details"
  on public.accommodation_payout_details
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Admins can read accommodation payout details"
  on public.accommodation_payout_details
  for select
  to authenticated
  using ((select public.is_accommodation_payout_admin()));