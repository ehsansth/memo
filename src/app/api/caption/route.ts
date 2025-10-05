import { NextRequest } from "next/server";
import { updateMemory } from "@/lib/db-firestore";
import { visionModel } from "@/lib/ai";
import { embedText } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { memoryId, imageUrl } = await req.json();
  if (!memoryId || !imageUrl) return new Response("bad request", { status: 400 });

  const prompt = `Return two lines:
1) A short factual caption (<=18 words).
2) 5-8 lowercase tags (comma separated, no '#'). Avoid guessing identities.`;

  const r = await visionModel.generateContent([{ text: prompt }, { text: `Image URL: ${imageUrl}` }]);
  const out = (r.response.text() || "").trim();
  const [cap = "", tags = ""] = out.split("\n");
  const caption = cap.replace(/^[-•]\s*/, "").trim();
  const tagsLine = tags.replace(/^[-•]\s*/, "").trim();

  let embedding: number[] | null = null;
  try {
    if (caption) embedding = Array.from(await embedText(caption));
  } catch {}

  await updateMemory(memoryId, {
    captionAI: caption || null,
    tagsAI: tagsLine || null,
    embedding,
  });

  return Response.json({ ok: true, caption, tags: tagsLine });
}
