import { auth0 } from './auth0';

export type AppRole = 'CAREGIVER' | 'PATIENT';

export type AppUser = {
  id: string;
  auth0Id: string;
  email?: string;
  name?: string;
  role: AppRole;
};

function resolveRole(user: Record<string, unknown>): AppRole {
  const appMetadata = (user['app_metadata'] ?? {}) as Record<string, unknown>;
  const appMetadataRoles = Array.isArray(appMetadata['roles'])
    ? (appMetadata['roles'] as unknown[])
    : [];

  const candidates = [
    user['role'],
    appMetadata['role'],
    appMetadataRoles[0],
    user['https://memo.app/role'],
  ].filter((value): value is string => typeof value === 'string');

  for (const raw of candidates) {
    const normalized = raw.toUpperCase();
    if (normalized === 'CAREGIVER' || normalized === 'PATIENT') {
      return normalized;
    }
  }

  return 'CAREGIVER';
}

export async function requireUser(): Promise<AppUser> {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error('unauthorized');

  const auth0Id = session.user.sub ?? 'unknown-auth0-user';
  const email = session.user.email ?? undefined;
  const name = session.user.name ?? undefined;

  return {
    id: auth0Id,
    auth0Id,
    email,
    name,
    role: resolveRole(session.user as Record<string, unknown>),
  };
}

export async function requireRole(roles: AppRole[]): Promise<AppUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error('forbidden');
  }
  return user;
}
