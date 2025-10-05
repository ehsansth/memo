"use client"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import MuteToggle2 from "@/components/mute/mute-toggle2"

type QuizQuestion = {
  id: string
  memoryId: string
  prompt: string
  options: string[]
  correctIndex: number
  hint: string
  context?: {
    personName?: string
    eventName?: string
    placeName?: string
    captionAI?: string
    tagsAI?: string
  }
  imageDataUrl: string
}

type QuizSession = {
  sessionId: string
  questions: QuizQuestion[]
}

export default function PatientQuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [i, setI] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [reading, setReading] = useState(false) // ✅ track TTS playback state

  // Load quiz session once
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr("")
      try {
        const res = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ patientId: "demo-patient", limit: 5 }),
        })
        if (!res.ok) throw new Error(`Generate failed (${res.status})`)
        const js = (await res.json()) as QuizSession
        if (!js?.questions?.length) throw new Error("No questions returned.")
        if (!cancelled) {
          setSession(js)
          setI(0)
          setShowHint(false)
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to start quiz")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const q = useMemo(
    () => (session?.questions && session.questions[i]) ?? null,
    [session, i]
  )

  async function handleAnswer(idx: number) {
    if (!session || !q) return
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
      })

      const payload = (await res.json()) ?? {}
      const supportive =
        payload.supportive ??
        (payload.correct ? "✅ Correct!" : "Thanks for trying!")

      setFeedback(supportive)
      setTimeout(() => {
        setFeedback("")
        setShowHint(false)
        setI((x) => x + 1)
      }, 1200)
    } catch (e: any) {
      setFeedback(e?.message || "Something went wrong submitting your answer.")
      setTimeout(() => setFeedback(""), 1600)
    }
  }

  // ✅ Text-to-Speech handler for hint
  async function playHint(text: string) {
    try {
      setReading(true)
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play()
      audio.onended = () => setReading(false)
    } catch {
      setReading(false)
      console.warn("TTS playback failed")
    }
  }

  // Loading and error states
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-64 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]" />
        </div>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          Loading your quiz…
        </p>
  
        <style jsx>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    )
    if (err)
    return (
      <div className="p-6 space-y-3 text-center">
        <div className="text-red-600 font-medium">Error</div>
        <p className="text-sm">{err}</p>
        <Button onClick={() => location.reload()}>Retry</Button>
      </div>
    )

  // Completion screen
  if (session && i >= session.questions.length)
    return (
      <div className="text-center mt-40">
        <h1 className="text-4xl font-bold">Session Complete!</h1>
        <p className="mt-2 text-lg font-semibold text-muted-foreground">
          Great job! You’ve finished your quiz.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-6">
          <Button asChild className="w-48 px-9 py-7.5 text-xl font-semibold rounded-2xl">
            <a href="/patient/quiz">Next Quiz</a>
          </Button>
          <Button asChild variant="outline" className="w-48 px-9 py-7.5 text-xl font-semibold rounded-2xl">
            <a href="/">Home</a>
          </Button>
        </div>
      </div>
    )

  if (!q) return <div className="p-6 text-center">All done 🎉</div>

  const pct = Math.round((i / session.questions.length) * 100)
  const imgSrc = q.imageDataUrl || "/placeholder.svg"
  const altText = q.context?.captionAI || q.context?.personName || "memory"

  return (
    <div className="mx-auto max-w-md space-y-5">
      {/* Progress */}
      <div>
        <div className="mb-1 text-sm opacity-70">
          Question {i + 1} / {session.questions.length}
        </div>
        <Progress
          value={pct}
          className="[&>div]:transition-all [&>div]:duration-700 [&>div]:ease-in-out"
        />
      </div>

      {/* Quiz Card */}
      <Card>
        <CardContent className="p-4">
          <div className="relative aspect-square">
            <Image
              src={imgSrc}
              alt={altText}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="rounded-xl object-cover"
            />
          </div>

          {/* Question text + Mute toggle */}
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{q.prompt}</h2>
            <div className="scale-125">
              <MuteToggle2 />
            </div>
          </div>

          {/* Options */}
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start"
                onClick={() => handleAnswer(idx)}
              >
                {opt}
              </Button>
            ))}
          </div>

          {/* Hint */}
          {!showHint ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="mt-4 h-10 mx-auto flex items-center justify-center"
                onClick={() => setShowHint(true)}
              >
                Show Hint
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between bg-muted rounded-md p-3">
              <p className="text-sm opacity-80">Hint: {q.hint}</p>
              <button
                onClick={() => playHint(`Hint: ${q.hint}`)}
                aria-label="Play hint aloud"
                className={`
                  rounded-md p-2 transition-all duration-200
                  ${reading
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent dark:hover:bg-accent text-neutral-800 dark:text-neutral-100"
                  }
                `}
              >
                <MuteToggle2 />
              </button>
            </div>
          )}

          {feedback && (
            <div className="mt-3 text-sm text-green-600 text-center">
              {feedback}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
