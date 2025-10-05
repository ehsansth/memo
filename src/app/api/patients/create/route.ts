import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { requireRole } from "@/lib/guards";
import { createInvite, createPatient } from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const body = await req.json().catch(() => null);
  const displayNameRaw = typeof body?.displayName === "string" ? body.displayName : "";
  const displayName = displayNameRaw.trim();

  if (!displayName) {
    return Response.json({ error: "displayName is required" }, { status: 400 });
  }

  const patient = await createPatient(caregiverSub, displayName);

  const token = randomBytes(16).toString("hex");
  await createInvite(caregiverSub, token, 24, {
    patientId: patient.id,
    targetRole: "PATIENT",
  });

  const origin = req.nextUrl.origin;
  const loginUrl = new URL("/auth/login", origin);
  const returnTo = `/patient/complete?token=${token}`;
  loginUrl.searchParams.set("returnTo", returnTo);
  loginUrl.searchParams.set("screen_hint", "signup");

  return Response.json({
    patient: { id: patient.id, displayName: patient.displayName },
    signupUrl: loginUrl.toString(),
    token,
  });
}
