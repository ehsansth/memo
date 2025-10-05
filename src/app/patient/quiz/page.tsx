"use client";
import { useEffect, useMemo, useState } from "react";

type QuizQuestion = {
  id: string;
  memoryId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  context?: {
    personName?: string;
    eventName?: string;
    placeName?: string;
    captionAI?: string;
    tagsAI?: string;
  };
  imageDataUrl: string; // data URL
};

type QuizSession = {
  sessionId: string;
  questions: QuizQuestion[];
};

export default function PatientQuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Load quiz session once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ patientId: "demo-patient", limit: 4 }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Generate failed (${res.status}): ${text || "no body"}`);
        }

        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text().catch(() => "");
          throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
        }

        const js = (await res.json()) as QuizSession;
        if (!js?.questions?.length) throw new Error("No questions returned.");

        if (!cancelled) {
          setSession(js);
          setI(0);
          setShowHint(false);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to start quiz");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const q = useMemo(
    () => (session?.questions && session.questions[i]) ?? null,
    [session, i]
  );

  const answer = async (idx: number) => {
    if (!session || !q) return;
    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionId: q.id,
          chosenIndex: idx,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Answer failed (${res.status}): ${text || "no body"}`);
      }

      const payload = (await res.json()) ?? {};
      const supportive =
        payload.supportive ??
        (payload.correct ? "Correct!" : "Thanks for trying!");

      setFeedback(supportive);
      setTimeout(() => {
        setFeedback("");
        setShowHint(false);  // reset hint for next question
        setI((x) => x + 1);
      }, 1200);
    } catch (e: any) {
      setFeedback(e?.message || "Something went wrong submitting your answer.");
      setTimeout(() => setFeedback(""), 1600);
    }
  };

  // UI states
  if (loading) return <div className="p-6">Loading…</div>;
  if (err) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-red-600 font-medium">Error</div>
        <div className="text-sm">{err}</div>
        <button
          className="rounded-md border px-3 py-1"
          onClick={() => location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!session?.questions?.length) return <div className="p-6">No questions available yet.</div>;
  if (!q) return <div className="p-6">All done 🎉</div>;

  const imgSrc = q.imageDataUrl || "/placeholder.svg";
  const altText = q.context?.captionAI || q.context?.personName || "memory";

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <img
        src={imgSrc}
        alt={altText}
        className="w-full rounded-xl object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
      />

      <h2 className="text-xl font-semibold">{q.prompt}</h2>

      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => answer(idx)}
            className="w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50"
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Hint row: reveal-on-click + TTS */}
      <div className="flex items-center gap-3 pt-2">
        <button
          className="rounded-md border px-3 py-1"
          onClick={() => setShowHint((v) => !v)}
          aria-expanded={showHint}
          aria-controls="hint-text"
        >
          {showHint ? "Hide hint" : "Show hint"}
        </button>

        {showHint && (
          <button
            className="rounded-md border px-3 py-1"
            onClick={async () => {
              try {
                const t = `Hint: ${q.hint}`;
                const r = await fetch("/api/tts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  cache: "no-store",
                  body: JSON.stringify({ text: t }),
                });
                if (!r.ok) return;
                const blob = await r.blob();
                const url = URL.createObjectURL(blob);
                new Audio(url).play();
              } catch {
                /* ignore for demo */
              }
            }}
          >
            🔊 Hear it
          </button>
        )}
      </div>

      {showHint && (
        <div id="hint-text" className="text-sm opacity-80">
          {q.hint}
        </div>
      )}

      {feedback && <div className="text-green-600">{feedback}</div>}

      <div className="pt-2 text-sm opacity-60">
        Question {i + 1} of {session.questions.length}
      </div>
    </div>
  );
}
