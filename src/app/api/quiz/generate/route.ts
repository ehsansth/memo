// src/app/api/quiz/generate/route.ts
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import { db } from "@/lib/firebase-admin";
import { getPatientById, getPatientForCaregiver } from "@/lib/db-firestore";
import { v4 as uuid } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
const MODEL_ID = "gemini-2.0-flash";

/* ===================== helpers ===================== */

function extractMimeAndBase64(dataUrl: string) {
  const m = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  return { mime: m[1], b64: m[2] };
}
function coerceJSON(s: string) {
  if (!s) throw new Error("Empty model response");
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : s;
  return JSON.parse(raw);
}
function json(res: any, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type MemoryMeta = {
  title?: string | null;
  personName?: string | null;
  eventName?: string | null;
  placeName?: string | null;
};

// deterministic, field-first caption
function composeCaptionFromFields(meta: MemoryMeta) {
  const bits = [
    meta.personName ? `with ${meta.personName}` : "",
    meta.eventName ? `at ${meta.eventName}` : "",
    meta.placeName ? `in ${meta.placeName}` : "",
  ].filter(Boolean).join(" ");

  if (meta.title && bits) return `${meta.title} — ${bits}`.trim();
  if (meta.title) return meta.title.trim();
  if (bits) return bits.trim();
  return "A special memory.";
}

// light polish—NO new facts
async function polishCaptionWithGemini(model: any, meta: MemoryMeta, baseCaption: string) {
  const sys = `
You help with dementia memory reinforcement.
Rewrite the caption to be warm, short (<= 20 words), and patient-friendly.
STRICT:
- Use ONLY these details (title, person, event, place). Do NOT add new facts.
- Keep names/places exactly as given.
Return ONLY the caption text.
`.trim();
  const user = `
title: ${meta.title ?? ""}
person: ${meta.personName ?? ""}
event: ${meta.eventName ?? ""}
place: ${meta.placeName ?? ""}
draft_caption: ${baseCaption}
`.trim();

  try {
    const res = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: sys }] },
        { role: "user", parts: [{ text: user }] },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 120 },
    });
    const out = (res?.response?.text?.() ?? "").trim();
    if (!out || /```|\{|\[/.test(out)) return baseCaption;
    const words = out.split(/\s+/);
    return words.length > 22 ? baseCaption : out;
  } catch {
    return baseCaption;
  }
}

async function ensureCaptionFromFields(model: any, memId: string, meta: MemoryMeta) {
  const base = composeCaptionFromFields(meta);
  const polished = await polishCaptionWithGemini(model, meta, base);
  const captionAI = (polished || base).trim();
  await db.collection("memories").doc(memId).set(
    { captionAI: captionAI || null }, // requires db.settings({ ignoreUndefinedProperties: true })
    { merge: true }
  );
  return captionAI;
}

// hint helpers + fallback
function initials(name?: string | null) {
  if (!name) return "";
  return name.split(/\s+/).filter(Boolean).map(s => s[0]).join("").toUpperCase();
}
function startsWithLen(s?: string | null) {
  if (!s) return "";
  const first = s[0];
  const len = [...s].length;
  return `starts with '${first}' and has ${len} letters`;
}
function fallbackHint(meta: {personName?: string|null; eventName?: string|null; placeName?: string|null;}) {
  if (meta.placeName) return `The place ${startsWithLen(meta.placeName)}.`;
  if (meta.personName) return `Their initials are ${initials(meta.personName)}.`;
  if (meta.eventName) return `Think about the ${meta.eventName?.split(" ")[0] || "event"} we celebrated.`;
  return "Think of a familiar person, place, or event linked to this memory.";
}

/* ===================== route ===================== */

export async function POST(req: NextRequest) {
  // 1) Auth -> JSON on failure
  let user: any;
  try {
    user = await requireRole(["CAREGIVER", "PATIENT"]);
  } catch (e: any) {
    return json({ error: e?.message || "unauthorized" }, 401);
  }

  const auth0Sub = user.auth0Id || user.id;

  // 2) Body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const { patientId, memoryIds, limit = 4 } = body || {};
  const resolvedPatientId = typeof patientId === "string" ? patientId.trim() : "";
  if (!resolvedPatientId) return json({ error: "patientId required" }, 400);

  let caregiverSub: string | null = null;
  try {
    if (user.role === "CAREGIVER") {
      const patient = await getPatientForCaregiver(resolvedPatientId, auth0Sub);
      if (!patient) return json({ error: "Patient not found" }, 404);
      caregiverSub = auth0Sub;
    } else {
      const patient = await getPatientById(resolvedPatientId);
      if (!patient || patient.patientSub !== auth0Sub) {
        return json({ error: "Patient not found" }, 404);
      }
      caregiverSub = patient.caregiverSub;
    }
  } catch (err) {
    return json({ error: (err as Error).message || "Unable to load patient" }, 400);
  }

  if (!caregiverSub) return json({ error: "Unable to resolve caregiver" }, 500);

  // 3) Resolve memory IDs (no composite index requirements)
  let memIds: string[] = Array.isArray(memoryIds) ? memoryIds : [];
  if (memIds.length === 0) {
    const snap = await db
      .collection("memories")
      .where("caregiverSub", "==", caregiverSub)
      .where("patientId", "==", resolvedPatientId)
      .orderBy("createdAt", "desc")
      .limit(Math.max(1, Math.min(10, Number(limit) || 4)))
      .get();
    memIds = snap.docs.map((d) => d.id);
  }
  if (memIds.length === 0) return json({ error: "No memories found" }, 404);

  // 4) Load + verify ownership
  const memDocs = await Promise.all(memIds.map(async (id: string) => {
    const doc = await db.collection("memories").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.caregiverSub !== caregiverSub || data.patientId !== resolvedPatientId) {
      return null;
    }
    return { id, ...data };
  }));
  const memories = memDocs.filter(Boolean) as Array<{
    id: string;
    imageUrl: string;
    title?: string | null;
    personName?: string | null;
    eventName?: string | null;
    placeName?: string | null;
    captionAI?: string | null;
  }>;
  if (memories.length === 0) return json({ error: "No accessible memories" }, 404);

  // 5) Gemini
  if (!process.env.GOOGLE_API_KEY) return json({ error: "GOOGLE_API_KEY missing" }, 500);
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  // 6) Build questions
  const questions: any[] = [];

  for (const m of memories) {
    try {
      // Ensure caption from fields (save back)
      const captionAI =
        (m.captionAI && typeof m.captionAI === "string" && m.captionAI.trim()) ||
        (await ensureCaptionFromFields(model, m.id, {
          title: m.title ?? null,
          personName: m.personName ?? null,
          eventName: m.eventName ?? null,
          placeName: m.placeName ?? null,
        }));

      // Prompt: enforce concrete hint
      const { mime, b64 } = extractMimeAndBase64(m.imageUrl);
      const prompt = `
Create ONE multiple-choice question (MCQ) for memory reinforcement.

Use ONLY these details (do not invent facts):
- Title: ${String(m.title ?? "")}
- Person: ${String(m.personName ?? "")}
- Event: ${String(m.eventName ?? "")}
- Place: ${String(m.placeName ?? "")}
- Caption: ${captionAI}

Rules:
- EXACTLY 1 question.
- 4 options total; 1 correct.
- Prefer questions about person/event/place if available.
- The HINT must be specific and contentful. It must NOT say "check the caption", "look closely", or similar.
  Examples of acceptable hints:
  - "The place ${startsWithLen(m.placeName ?? "")}."
  - "Their initials are ${initials(m.personName ?? "")}."
  - "Think about the ${String(m.eventName ?? "").split(" ")[0] || "event"} we celebrated."
Return strict JSON: {"question": string, "options": string[4], "correctIndex": 0-3, "hint": string}.
`.trim();

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ inlineData: { mimeType: mime, data: b64 } }, { text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 300, responseMimeType: "application/json" },
      });

      const text = result?.response?.text?.() ?? "";
      const out = coerceJSON(text);
      if (!out || !Array.isArray(out.options) || typeof out.correctIndex !== "number") {
        throw new Error("Bad model output");
      }

      // sanitize hint
      let hintText = (out.hint || "").trim();
      if (!hintText || /check the caption|look|see the caption/i.test(hintText)) {
        hintText = fallbackHint({
          personName: m.personName ?? null,
          eventName: m.eventName ?? null,
          placeName: m.placeName ?? null,
        });
      }

      const ctx = {
        personName: m.personName ?? null,
        eventName: m.eventName ?? null,
        placeName: m.placeName ?? null,
        captionAI: captionAI || null,
      };

      questions.push({
        id: uuid(),
        memoryId: m.id,
        prompt: out.question || "What is being remembered here?",
        options: out.options.slice(0, 4),
        correctIndex: Math.max(0, Math.min(3, out.correctIndex)),
        hint: hintText,
        context: ctx,                    // no undefined
        imageDataUrl: m.imageUrl,        // exact original base64
      });
    } catch {
      // skip this memory to keep the demo flowing
    }
  }

  if (questions.length === 0) return json({ error: "No questions generated" }, 500);

  // 7) Persist session
  const sessionId = uuid();
  const sessionDoc = {
    createdBySub: auth0Sub,
    caregiverSub,
    patientId: resolvedPatientId,
    memoryIds: questions.map(q => q.memoryId),
  // Use Timestamp if you exported it; Date works for demo
    createdAt: new Date(),
    status: "active" as const,
    questions,
  };
  await db.collection("quiz_sessions").doc(sessionId).set(sessionDoc);

  return json({ sessionId, ...sessionDoc }, 200);
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" },
  });
}
