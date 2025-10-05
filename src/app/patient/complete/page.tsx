import { requireUser } from "@/lib/guards";
import {
  consumeInvite,
  linkCaregiverPatient,
  linkPatientAccount,
  setUserRole,
} from "@/lib/db-firestore";

export default async function Complete({ searchParams }: { searchParams: { token?: string } }) {
  const user = await requireUser();
  const token = searchParams.token;
  if (!token) return <div>Missing invite token.</div>;

  const inv = await consumeInvite(token);
  const patientSub = user.auth0Id || user.id;
  if (inv.patientId) {
    await linkPatientAccount(inv.caregiverSub, inv.patientId, patientSub);
  }
  await setUserRole(patientSub, inv.targetRole || "PATIENT");
  await linkCaregiverPatient(inv.caregiverSub, patientSub);

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">All set!</h1>
      <p className="mt-2">Your account is now linked to your caregiver. You can go to the Patient view.</p>
      <a className="mt-4 inline-block border px-4 py-2 rounded-lg" href="/patient/quiz">Go to Patient</a>
    </main>
  );
}
