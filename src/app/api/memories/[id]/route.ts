import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import { getMemoryForCaregiver, updateMemory } from "@/lib/db-firestore";
import type { MemoryDoc } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_FIELDS = new Set([
  "title",
  "personName",
  "eventName",
  "placeName",
  "dateLabel",
  "captionAI",
  "tagsAI",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;
  const memoryId = params.id;

  if (!memoryId) {
    return Response.json({ error: "Memory id is required" }, { status: 400 });
  }

  const memory = await getMemoryForCaregiver(memoryId, caregiverSub);
  if (!memory) {
    return Response.json({ error: "Memory not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: Partial<MemoryDoc> = {};

  for (const field of ALLOWED_FIELDS) {
    if (!(field in body)) continue;
    const raw = body[field];
    if (raw === null) {
      patch[field as keyof MemoryDoc] = null;
      continue;
    }
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (field === "title") {
      if (!trimmed) continue;
      patch[field as keyof MemoryDoc] = trimmed as MemoryDoc["title"];
      continue;
    }
    patch[field as keyof MemoryDoc] = (trimmed || null) as MemoryDoc["personName"];
  }

  if (!Object.keys(patch).length) {
    return Response.json({ ok: true, memory });
  }

  await updateMemory(memoryId, patch);
  const updated = await getMemoryForCaregiver(memoryId, caregiverSub);

  return Response.json({ ok: true, memory: updated ?? memory });
}
