// src/app/api/quiz/answer/route.ts
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireRole(["CAREGIVER", "PATIENT"]);
  const { sessionId, questionId, chosenIndex } = await req.json() || {};
  if (!sessionId || !questionId || typeof chosenIndex !== "number") {
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }

  const ref = db.collection("quiz_sessions").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  const sess = snap.data() as any;
  const q = (sess.questions || []).find((x: any) => x.id === questionId);
  if (!q) return new Response(JSON.stringify({ error: "Question not found" }), { status: 404 });

  const correct = Number(chosenIndex) === Number(q.correctIndex);
  const historyItem = {
    questionId,
    chosenIndex,
    correctIndex: q.correctIndex,
    correct,
    ts: new Date(),
  };

  await ref.update({
    history: FieldValue.arrayUnion(historyItem),
  });

  const supportive = correct
    ? `Great job! ${q?.context?.personName ? `Yes, this is ${q.context.personName}.` : "Correct answer."}`
    : `Good try! The correct answer is "${q.options[q.correctIndex]}". ${q?.context?.eventName ? `This was ${q.context.eventName}.` : ""}`;

  if (!correct) {
    await db.collection("memories").doc(q.memoryId).set({ prioritize: true }, { merge: true });
  }

  return new Response(JSON.stringify({ correct, supportive }), { status: 200 });
}
