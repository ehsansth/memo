import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import { createMemory } from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CAREGIVER"]);
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const title = (form.get("title") as string)?.trim() || "Memory";
  const personName = (form.get("personName") as string)?.trim() || null;
  const eventName = (form.get("eventName") as string)?.trim() || null;
  const placeName = (form.get("placeName") as string)?.trim() || null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "application/octet-stream";
  const imageUrl = `data:${mimeType};base64,${base64}`;

  const memory = await createMemory(user.auth0Id || user.id, {
    title,
    personName,
    eventName,
    placeName,
    imageUrl,
  });

  return Response.json({ ok: true, memory });
}
