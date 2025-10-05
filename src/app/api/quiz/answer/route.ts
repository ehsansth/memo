// src/app/api/quiz/answer/route.ts
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/guards";
import { db } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return null;
};

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

  try {
    const updatedSnap = await ref.get();
    if (updatedSnap.exists) {
      const session = updatedSnap.data() as any;
      const questions: any[] = Array.isArray(session.questions) ? session.questions : [];
      const history: any[] = Array.isArray(session.history) ? session.history : [];
      const totalQuestions = questions.length;

      if (totalQuestions > 0 && history.length >= totalQuestions) {
        const responses = questions.map((question) => {
          const candidates = history.filter((entry) => entry.questionId === question.id);
          const record = candidates.length
            ? candidates
                .slice()
                .sort((a, b) => {
                  const at = toDate(a?.ts)?.getTime() ?? 0;
                  const bt = toDate(b?.ts)?.getTime() ?? 0;
                  return at - bt;
                })
                .at(-1)
            : null;
          return {
            questionId: question.id,
            memoryId: question.memoryId,
            prompt: question.prompt,
            options: question.options,
            correctIndex: question.correctIndex,
            chosenIndex: record?.chosenIndex ?? null,
            correct: Boolean(record?.correct),
            hint: question.hint,
            context: question.context ?? null,
            imageDataUrl: question.imageDataUrl,
            answeredAt: toDate(record?.ts),
          };
        });

        const answeredCount = responses.filter((response) => response.chosenIndex !== null).length;
        const correctCount = responses.filter((response) => response.correct).length;
        const scorePercent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const resultsRef = db.collection("quiz_results").doc(sessionId);
        // TODO: If quiz questions become large in number or image payloads grow, consider storing
        // lightweight references instead of full data URLs to stay within Firestore doc limits.
        await resultsRef.set(
          {
            sessionId,
            patientId: session.patientId ?? null,
            caregiverSub: session.caregiverSub ?? null,
            createdBySub: session.createdBySub ?? null,
            totalQuestions,
            answeredCount,
            correctCount,
            scorePercent,
            responses,
            createdAt: toDate(session.createdAt) ?? new Date(),
            completedAt: new Date(),
          },
          { merge: true }
        );

        if (session.status !== "completed") {
          await ref.set(
            {
              status: "completed",
              completedAt: new Date(),
            },
            { merge: true }
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to finalize quiz session", error);
  }

  const supportive = correct
    ? `Great job! ${q?.context?.personName ? `Yes, this is ${q.context.personName}.` : "Correct answer."}`
    : `Good try! The correct answer is "${q.options[q.correctIndex]}". ${q?.context?.eventName ? `This was ${q.context.eventName}.` : ""}`;

  if (!correct) {
    await db.collection("memories").doc(q.memoryId).set({ prioritize: true }, { merge: true });
  }

  return new Response(JSON.stringify({ correct, supportive }), { status: 200 });
}
