import { auth0 } from "./auth0";
import { getUserRoleDoc, setUserRole } from "./db-firestore";
import type { AppRole } from "./types";

export type AppUser = {
  id: string;
  auth0Id: string;
  email?: string;
  name?: string;
  role: AppRole;
};

export async function requireUser(): Promise<AppUser> {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error("unauthorized");

  const auth0Id = session.user.sub ?? "unknown-auth0-user";
  const email = session.user.email ?? undefined;
  const name = session.user.name ?? undefined;
  const roleDoc = await getUserRoleDoc(auth0Id);
  const role: AppRole = roleDoc?.role ?? "CAREGIVER";

  return {
    id: auth0Id,
    auth0Id,
    email,
    name,
    role,
  };
}

export async function requireRole(roles: AppRole[]): Promise<AppUser> {
  const user = await requireUser();
  const roleDoc = await getUserRoleDoc(user.auth0Id);
  let effectiveRole = roleDoc?.role ?? user.role;

  if (!roleDoc && roles.includes("CAREGIVER")) {
    await setUserRole(user.auth0Id, "CAREGIVER");
    effectiveRole = "CAREGIVER";
  }

  if (!roles.includes(effectiveRole)) {
    throw new Error("forbidden");
  }

  return { ...user, role: effectiveRole };
}
