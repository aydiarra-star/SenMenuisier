-- Executed against a disposable PostgreSQL instance in CI.
-- The test bootstraps only the Supabase Auth objects used by the migrations.

insert into auth.users (id) values
  ('10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000003')
on conflict do nothing;

-- Profile writes are restricted to user-editable columns.
select 1 / case when has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE') then 1 else 0 end;
select 1 / case when has_column_privilege('authenticated', 'public.profiles', 'phone', 'UPDATE') then 1 else 0 end;
select 1 / case when not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE') then 1 else 0 end;
select 1 / case when not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE') then 1 else 0 end;
select 1 / case when not has_column_privilege('authenticated', 'public.profiles', 'updated_at', 'UPDATE') then 1 else 0 end;
select 1 / case when not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'INSERT') then 1 else 0 end;

-- Owner A creates an atelier through the public RPC. Creation must be atomic.
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);
select public.create_workshop('Atelier Test A', 'Dakar') as workshop_a \\gset
reset role;

-- A second, unrelated owner creates a separate atelier.
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);
select public.create_workshop('Atelier Test B', 'Bakel') as workshop_b \\gset
reset role;

-- The first owner membership and audit event must have been created with the atelier.
select 1 / case when exists (
  select 1 from public.workshop_memberships
  where workshop_id = :'workshop_a'::uuid
    and user_id = '10000000-0000-4000-8000-000000000001'
    and role = 'owner' and status = 'active'
) then 1 else 0 end;
select 1 / case when exists (
  select 1 from public.audit_events
  where workshop_id = :'workshop_a'::uuid
    and actor_user_id = '10000000-0000-4000-8000-000000000001'
    and action = 'workshop.created'
) then 1 else 0 end;

-- Create a manager membership as a trusted database operator.
insert into public.workshop_memberships (workshop_id, user_id, role, status)
values (:'workshop_a'::uuid, '10000000-0000-4000-8000-000000000003', 'manager', 'active');

-- Owner A sees A but never B.
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', false);
select 1 / case when (
  select count(*) from public.workshops where id = :'workshop_a'::uuid
) = 1 then 1 else 0 end;
select 1 / case when (
  select count(*) from public.workshops where id = :'workshop_b'::uuid
) = 0 then 1 else 0 end;
select 1 / case when private.has_workshop_permission(:'workshop_a'::uuid, 'finance.read') then 1 else 0 end;

-- Owner can update allowed workshop fields; the database owns updated_at.
select updated_at as before_updated_at
from public.workshops where id = :'workshop_a'::uuid \\gset
select pg_sleep(0.02);
update public.workshops set name = 'Atelier Test A Modifié'
where id = :'workshop_a'::uuid;
select 1 / case when (
  select updated_at > :'before_updated_at'::timestamptz
  from public.workshops where id = :'workshop_a'::uuid
) then 1 else 0 end;
reset role;

-- Owner B cannot see A even when its UUID is known.
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', false);
select 1 / case when (
  select count(*) from public.workshops where id = :'workshop_a'::uuid
) = 0 then 1 else 0 end;
reset role;

-- Manager has operational membership but no finance or membership-admin rights by default.
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', false);
select 1 / case when not private.has_workshop_permission(:'workshop_a'::uuid, 'finance.read') then 1 else 0 end;
select 1 / case when not private.has_workshop_permission(:'workshop_a'::uuid, 'finance.write') then 1 else 0 end;
select 1 / case when not private.has_workshop_permission(:'workshop_a'::uuid, 'members.manage') then 1 else 0 end;
select 1 / case when (
  select count(*) from public.workshops where id = :'workshop_a'::uuid
) = 1 then 1 else 0 end;
-- A manager's UPDATE policy must affect zero rows.
with changed as (
  update public.workshops set name = 'Modification interdite'
  where id = :'workshop_a'::uuid returning id
)
select 1 / case when count(*) = 0 then 1 else 0 end from changed;
reset role;

-- Client roles cannot write memberships or forge audit history directly.
select 1 / case when not has_table_privilege('authenticated', 'public.workshop_memberships', 'INSERT') then 1 else 0 end;
select 1 / case when not has_table_privilege('authenticated', 'public.audit_events', 'INSERT') then 1 else 0 end;
select 1 / case when not has_table_privilege('authenticated', 'public.workshop_invitations', 'SELECT') then 1 else 0 end;
select 1 / case when not has_table_privilege('authenticated', 'public.workshop_permission_grants', 'SELECT') then 1 else 0 end;

\\echo 'PostgreSQL RLS integration tests: PASS'
