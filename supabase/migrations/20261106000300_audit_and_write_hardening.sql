-- Close direct audit-log writes: clients must not be able to forge history.
begin;

drop policy if exists audit_events_insert_actor on public.audit_events;
revoke insert, update, delete on public.audit_events from authenticated;
grant select on public.audit_events to authenticated;
revoke usage, select on sequence public.audit_events_id_seq from authenticated;

-- updated_at is maintained by the database, not supplied by a client.
revoke update on public.workshops from authenticated;
grant update (name, city) on public.workshops to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger workshops_touch_updated_at
before update on public.workshops
for each row execute function public.touch_updated_at();

commit;
