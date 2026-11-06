-- SenMenuisier — phase 2 identity and workshop isolation
-- This migration is a reviewed draft. Apply only to a dedicated SenMenuisier Supabase project.
begin;

create extension if not exists pgcrypto with schema extensions;

-- Internal authorization helpers live outside Supabase's exposed API schemas.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create type public.workshop_role as enum ('owner', 'manager', 'carpenter', 'apprentice');
create type public.membership_status as enum ('active', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  city text not null check (char_length(trim(city)) between 2 and 80),
  country_code text not null default 'SN' check (country_code = 'SN'),
  timezone text not null default 'Africa/Dakar' check (timezone = 'Africa/Dakar'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, created_by)
);

create table public.workshop_memberships (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workshop_role not null,
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (workshop_id, user_id),
  unique (id, workshop_id),
  check ((status = 'active' and revoked_at is null) or (status = 'revoked' and revoked_at is not null))
);

create index workshop_memberships_user_active_idx
  on public.workshop_memberships(user_id, workshop_id) where status = 'active';

create table public.workshop_invitations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  email_normalized text not null check (email_normalized = lower(trim(email_normalized))),
  role public.workshop_role not null check (role <> 'owner'),
  token_hash bytea not null unique,
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at),
  check (accepted_at is null or revoked_at is null)
);

create index workshop_invitations_pending_idx
  on public.workshop_invitations(workshop_id, expires_at)
  where accepted_at is null and revoked_at is null;

create table public.workshop_permission_grants (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null,
  workshop_id uuid not null,
  permission text not null check (permission in (
    'members.manage',
    'quotes.costs.read', 'quotes.costs.write',
    'inventory.costs.read', 'inventory.costs.write',
    'suppliers.costs.read', 'suppliers.costs.write',
    'finance.read', 'finance.write',
    'audit.read'
  )),
  granted_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  foreign key (membership_id, workshop_id)
    references public.workshop_memberships(id, workshop_id) on delete cascade,
  unique (membership_id, permission)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (char_length(action) between 2 and 100),
  target_type text not null check (char_length(target_type) between 2 and 80),
  target_id text,
  metadata jsonb not null default '{}'::jsonb check (pg_column_size(metadata) <= 8192),
  created_at timestamptz not null default now()
);

create index audit_events_workshop_created_idx
  on public.audit_events(workshop_id, created_at desc);

-- SECURITY DEFINER is restricted to small authorization predicates to avoid RLS recursion.
-- No table writes or user-controlled dynamic SQL occur in these functions.
create or replace function private.is_active_workshop_member(p_workshop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workshop_memberships m
    where m.workshop_id = p_workshop_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

create or replace function private.has_workshop_permission(
  p_workshop_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workshop_memberships m
    where m.workshop_id = p_workshop_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and (
        m.role = 'owner'
        or (m.role = 'manager' and p_permission in (
          'workshop.read', 'clients.read', 'clients.write', 'quotes.read', 'quotes.write',
          'production.read', 'production.write', 'inventory.read', 'inventory.write',
          'suppliers.read', 'suppliers.write', 'pricebook.read'
        ))
        or (m.role = 'carpenter' and p_permission in (
          'workshop.read', 'production.read', 'production.write', 'inventory.read', 'pricebook.read'
        ))
        or (m.role = 'apprentice' and p_permission in (
          'workshop.read', 'production.read', 'inventory.read'
        ))
        or exists (
          select 1 from public.workshop_permission_grants g
          where g.membership_id = m.id
            and g.workshop_id = m.workshop_id
            and g.permission = p_permission
            and g.revoked_at is null
        )
      )
  );
$$;

revoke all on function private.is_active_workshop_member(uuid) from public, anon;
revoke all on function private.has_workshop_permission(uuid, text) from public, anon;
grant execute on function private.is_active_workshop_member(uuid) to authenticated;
grant execute on function private.has_workshop_permission(uuid, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_memberships enable row level security;
alter table public.workshop_invitations enable row level security;
alter table public.workshop_permission_grants enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_self on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy workshops_select_member on public.workshops
  for select to authenticated using (private.is_active_workshop_member(id));
create policy workshops_insert_creator on public.workshops
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy workshops_update_owner on public.workshops
  for update to authenticated using (private.has_workshop_permission(id, 'workshop.write'))
  with check (private.has_workshop_permission(id, 'workshop.write'));

create policy memberships_select_self_or_manager on public.workshop_memberships
  for select to authenticated using (
    user_id = (select auth.uid())
    or private.has_workshop_permission(workshop_id, 'members.manage')
  );
-- Membership creation/revocation is server-mediated by a verified invitation workflow.
-- No direct INSERT/UPDATE/DELETE policy is intentionally provided to authenticated clients.

-- Invitations and grants are deliberately server-mediated; no authenticated table policies.
-- Their raw token hashes and permission grant records are never exposed through the client API.

create policy audit_events_select_authorized on public.audit_events
  for select to authenticated using (private.has_workshop_permission(workshop_id, 'audit.read'));
create policy audit_events_insert_actor on public.audit_events
  for insert to authenticated with check (
    actor_user_id = (select auth.uid())
    and private.is_active_workshop_member(workshop_id)
  );
-- Audit events are append-only: no UPDATE or DELETE policy.

-- Authenticated users receive only the table privileges required by the policies.
revoke all on public.profiles, public.workshops, public.workshop_memberships,
  public.workshop_invitations, public.workshop_permission_grants, public.audit_events
  from anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.workshops to authenticated;
grant select on public.workshop_memberships to authenticated;
grant select, insert on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;

commit;
