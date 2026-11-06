import type { WorkshopRole } from "./types";

export const workshopPermissions = [
  "workshop.read",
  "members.manage",
  "clients.read",
  "clients.write",
  "quotes.read",
  "quotes.write",
  "production.read",
  "production.write",
  "inventory.read",
  "inventory.write",
  "suppliers.read",
  "suppliers.write",
  "pricebook.read",
  "pricebook.write",
  "finance.read",
  "finance.write",
  "audit.read",
] as const;

export type WorkshopPermission = (typeof workshopPermissions)[number];

/**
 * Least-privilege defaults. Finance is owner-only unless an owner explicitly
 * grants the exact permission to a member. Grants must be loaded and verified
 * on the server; never accept them from client input or editable user metadata.
 */
const defaultPermissions: Record<WorkshopRole, readonly WorkshopPermission[]> = {
  owner: workshopPermissions,
  manager: [
    "workshop.read",
    "clients.read",
    "clients.write",
    "quotes.read",
    "quotes.write",
    "production.read",
    "production.write",
    "inventory.read",
    "inventory.write",
    "suppliers.read",
    "suppliers.write",
    "pricebook.read",
  ],
  carpenter: [
    "workshop.read",
    "production.read",
    "production.write",
    "inventory.read",
    "pricebook.read",
  ],
  apprentice: [
    "workshop.read",
    "production.read",
    "inventory.read",
  ],
};

export function canAccessWorkshopPermission(
  role: WorkshopRole,
  permission: WorkshopPermission,
  serverVerifiedGrants: readonly WorkshopPermission[] = [],
): boolean {
  if (defaultPermissions[role].includes(permission)) return true;
  return serverVerifiedGrants.includes(permission);
}
