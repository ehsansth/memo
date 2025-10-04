import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from './db';

export async function requireUser(request: Request) {
  const session = await getSession();
  if (!session?.user) throw new Error('unauthorized');
  const auth0Id = session.user.sub!;
  let user = await prisma.user.findUnique({ where: { auth0Id }});
  if (!user) {
    user = await prisma.user.create({
      data: {
        auth0Id,
        email: session.user.email!,
        role: 'CAREGIVER' // default; caregiver creates patient later
      }
    });
  }
  return user;
}
