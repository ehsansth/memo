import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import type { AfterCallbackHandler } from '@auth0/nextjs-auth0';

import { prisma } from '@/lib/db';

const ensureUser: AfterCallbackHandler = async (_req, _res, session) => {
  const auth0Id = session.user.sub;
  const email = session.user.email;

  if (!auth0Id || !email) {
    return session;
  }

  await prisma.user.upsert({
    where: { auth0Id },
    create: { auth0Id, email },
    update: { email },
  });

  return session;
};

const handler = handleAuth({
  async callback(req, res) {
    return handleCallback(req, res, { afterCallback: ensureUser });
  },
});

export const GET = handler;
export const POST = handler;
export const runtime = 'nodejs';
