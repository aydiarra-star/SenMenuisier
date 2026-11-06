-- Restrict profile writes to user-editable identity fields only.
-- The database owns identifiers and timestamps.
begin;

revoke insert, update on public.profiles from authenticated;
grant insert (id, display_name, phone) on public.profiles to authenticated;
grant update (display_name, phone) on public.profiles to authenticated;

commit;
