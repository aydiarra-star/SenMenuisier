-- Complete atelier creation as one trusted transaction.
-- The client cannot directly INSERT a workshop or manufacture its owner membership.
begin;

drop policy if exists workshops_insert_creator on public.workshops;

revoke insert on public.workshops from authenticated;
revoke update on public.workshops from authenticated;
grant update (name, city, country_code, timezone, updated_at) on public.workshops to authenticated;

create or replace function public.create_workshop(
  p_name text,
  p_city text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_workshop_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_name is null or char_length(trim(p_name)) not between 2 and 120 then
    raise exception 'Invalid workshop name' using errcode = '22023';
  end if;

  if p_city is null or char_length(trim(p_city)) not between 2 and 80 then
    raise exception 'Invalid workshop city' using errcode = '22023';
  end if;

  insert into public.workshops (name, city, created_by)
  values (trim(p_name), trim(p_city), v_user_id)
  returning id into v_workshop_id;

  insert into public.workshop_memberships (workshop_id, user_id, role, status)
  values (v_workshop_id, v_user_id, 'owner', 'active');

  insert into public.audit_events (workshop_id, actor_user_id, action, target_type, target_id)
  values (v_workshop_id, v_user_id, 'workshop.created', 'workshop', v_workshop_id::text);

  return v_workshop_id;
end;
$$;

revoke all on function public.create_workshop(text, text) from public, anon;
grant execute on function public.create_workshop(text, text) to authenticated;

commit;
