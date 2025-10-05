import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import {
  createMemoryForPatient,
  getPatientForCaregiver,
} from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const form = await req.formData();
  const file = form.get("file");
  const patientIdRaw = form.get("patientId");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (typeof patientIdRaw !== "string" || !patientIdRaw.trim()) {
    return Response.json({ error: "patientId is required" }, { status: 400 });
  }

  const patientId = patientIdRaw.trim();
  const patient = await getPatientForCaregiver(patientId, caregiverSub);
  if (!patient) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }

  const title = ((form.get("title") as string) ?? "").trim() || "Memory";
  const personName = ((form.get("personName") as string) ?? "").trim() || null;
  const eventName = ((form.get("eventName") as string) ?? "").trim() || null;
  const placeName = ((form.get("placeName") as string) ?? "").trim() || null;
  const dateLabel = ((form.get("dateLabel") as string) ?? "").trim() || null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";
  const imageUrl = `data:${mimeType};base64,${base64}`;
  // TODO: consider client-side compression to keep Firestore docs under the 1 MB limit.

  const memory = await createMemoryForPatient(caregiverSub, patient.id, {
    title,
    personName,
    eventName,
    placeName,
    dateLabel,
    imageUrl,
  });

  return Response.json({ ok: true, memory });
}
