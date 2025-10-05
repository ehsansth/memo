"use client"
import { useEffect, useState } from "react"
import { startSession, answer } from "@/lib/api.mock"
import QuizCard from "@/components/quiz/QuizCard"
import QuizProgress from "@/components/quiz/QuizProgress"
import type { SessionQuestion } from "@/lib/types"

export default function QuizPage() {
  const [qs, setQs] = useState<SessionQuestion[]>([])
  const [i, setI] = useState(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => { startSession().then(r => setQs(r.questions)) }, [])
  if (!qs.length) return <div>Loading…</div>
  if (i >= 5) return <div className="text-center">Session complete 🎉</div>

  async function handleAnswer(choice: string) {
    const r = await answer("sid", qs[i].id, choice)
    setFeedback(r.correct ? "✅ Correct!" : `ℹ️ ${r.supportive}\n${r.reveal}`)
    setTimeout(() => { setFeedback(""); setI(n => n + 1) }, 900)
  }

  return (
    <div className="mx-auto max-w-md">
      <QuizProgress current={i+1} total={5} />
      <QuizCard q={qs[i]} onAnswer={handleAnswer} />
      {feedback && <pre className="mt-3 text-sm whitespace-pre-wrap">{feedback}</pre>}
    </div>
  )
}