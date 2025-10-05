import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/guards';
import { randomBytes } from 'crypto';

export async function POST() {
  await requireRole(['CAREGIVER']);
  const token = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24*60*60*1000);
  const caregiver = await requireRole(['CAREGIVER']);
  await prisma.invite.create({ data: { token, caregiverId: caregiver.id, expiresAt } });
  return Response.json({ token });
}
