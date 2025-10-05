import { requireRole } from "@/lib/guards";
import { getPatientByPatientSub } from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRole(["PATIENT"]);
  const patient = await getPatientByPatientSub(user.auth0Id || user.id);
  if (!patient) {
    return Response.json({ error: "Patient record not found" }, { status: 404 });
  }

  return Response.json({
    patient: {
      id: patient.id,
      displayName: patient.displayName,
      caregiverSub: patient.caregiverSub,
    },
  });
}
