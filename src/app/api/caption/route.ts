import { NextRequest } from "next/server";
import { visionModel } from "@/lib/ai";
import { requireRole } from "@/lib/guards";
import { embedText } from "@/lib/embeddings";
import { getMemoryForCaregiver, updateMemory } from "@/lib/db-firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CAREGIVER"]);
  const caregiverSub = user.auth0Id || user.id;

  const body = await req.json().catch(() => null);
  const memoryId = typeof body?.memoryId === "string" ? body.memoryId.trim() : "";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";

  if (!memoryId || !imageUrl) {
    return Response.json({ error: "memoryId and imageUrl are required" }, { status: 400 });
  }

  const memory = await getMemoryForCaregiver(memoryId, caregiverSub);
  if (!memory) {
    return Response.json({ error: "Memory not found" }, { status: 404 });
  }

  const prompt = `Return two lines:
  A short factual caption (<=18 words).
  5-8 lowercase tags (comma separated, no '#'). Avoid guessing identities.`;

  const r = await visionModel.generateContent([
    { text: prompt },
    { text: `Image URL: ${imageUrl}` },
  ]);
  const out = (r.response.text() || "").trim();
  const [cap = "", tags = ""] = out.split("\n");
  const caption = cap.replace(/^[-•]\s*/, "").trim();
  const tagsLine = tags.replace(/^[-•]\s*/, "").trim();

  let embedding: number[] | null = null;
  try {
    if (caption) embedding = Array.from(await embedText(caption));
  } catch {}

  await updateMemory(memory.id, {
    captionAI: caption || null,
    tagsAI: tagsLine || null,
    embedding,
  });

  return Response.json({ ok: true, caption, tags: tagsLine });
}
