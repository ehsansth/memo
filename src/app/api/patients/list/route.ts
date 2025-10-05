import { requireRole } from "@/lib/guards";
import { listPatientsByCaregiver } from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const patients = await listPatientsByCaregiver(caregiverSub);

  return Response.json(
    patients.map((patient) => ({ id: patient.id, displayName: patient.displayName }))
  );
}
