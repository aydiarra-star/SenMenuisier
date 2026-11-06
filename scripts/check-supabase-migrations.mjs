import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const identity = read("supabase/migrations/20261106000100_identity_workshops_rls.sql");
const rpc = read("supabase/migrations/20261106000200_create_workshop_rpc.sql");
const hardening = read("supabase/migrations/20261106000300_audit_and_write_hardening.sql");

const tables = ["profiles", "workshops", "workshop_memberships", "workshop_invitations", "workshop_permission_grants", "audit_events"];
let checks = 0;
for (const table of tables) {
  assert.match(identity, new RegExp("alter table public\\." + table + " enable row level security", "i"), "RLS missing on " + table);
  checks++;
}
const contracts = [
  [identity, /create schema if not exists private/i, "private schema missing"],
  [identity, /revoke all on schema private from public, anon, authenticated/i, "private schema default privileges not closed"],
  [identity, /grant usage on schema private to authenticated/i, "authenticated cannot invoke internal helpers"],
  [identity, /function private\.is_active_workshop_member[\s\S]*?security definer[\s\S]*?set search_path = ''/i, "membership helper must be SECURITY DEFINER with empty search_path"],
  [identity, /function private\.has_workshop_permission[\s\S]*?security definer[\s\S]*?set search_path = ''/i, "permission helper must be SECURITY DEFINER with empty search_path"],
  [rpc, /function private\.create_workshop[\s\S]*?security definer[\s\S]*?set search_path = ''/i, "private creation RPC must be SECURITY DEFINER with empty search_path"],
  [rpc, /function public\.create_workshop[\s\S]*?security invoker[\s\S]*?set search_path = ''/i, "public RPC wrapper must remain SECURITY INVOKER"],
  [rpc, /insert into public\.workshop_memberships[\s\S]*?'owner'/i, "workshop RPC must create owner membership atomically"],
  [rpc, /insert into public\.audit_events/i, "workshop RPC must record creation audit event"],
  [hardening, /revoke insert, update, delete on public\.audit_events from authenticated/i, "direct audit mutation must be revoked"],
  [hardening, /create trigger profiles_touch_updated_at/i, "profile updated_at trigger missing"],
  [hardening, /create trigger workshops_touch_updated_at/i, "workshop updated_at trigger missing"],
  [hardening, /grant update \(name, city\) on public\.workshops to authenticated/i, "workshop update must be column-limited"]
];
for (const [source, pattern, message] of contracts) {
  assert.match(source, pattern, message);
  checks++;
}
console.log("Contrat sécurité migrations : " + checks + " contrôles statiques réussis.");
