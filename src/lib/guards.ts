import { auth0 } from './auth0';
import { prisma } from './db';

export async function requireUser() {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error('unauthorized');

  const auth0Id = session.user.sub!;
  let user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0Id,
        email: session.user.email!,
        role: 'CAREGIVER',
      },
    });
  }
  return user;
}

export async function requireRole(roles: Array<'CAREGIVER'|'PATIENT'>) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error('forbidden');
  return user;
}
