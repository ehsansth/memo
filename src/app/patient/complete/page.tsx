import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/guards';

export default async function Complete({ searchParams }: { searchParams: { token?: string } }) {
  const user = await requireUser();
  const token = searchParams.token;
  if (!token) return <div>Missing invite token.</div>;

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.used || invite.expiresAt < new Date()) return <div>Invalid/expired invite.</div>;

  // flip role to PATIENT if needed
  if (user.role !== 'PATIENT') {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'PATIENT' } });
  }

  // link caregiver ↔ patient (many-to-many safe)
  await prisma.caregiverPatient.upsert({
    where: { caregiverId_patientId: { caregiverId: invite.caregiverId, patientId: user.id } },
    create: { caregiverId: invite.caregiverId, patientId: user.id },
    update: {},
  });

  await prisma.invite.update({ where: { token }, data: { used: true } });

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">All set!</h1>
      <p className="mt-2">Your account is now linked to your caregiver. You can go to the Patient view.</p>
      <a className="mt-4 inline-block border px-4 py-2 rounded-lg" href="/patient/quiz">Go to Patient</a>
    </main>
  );
}
