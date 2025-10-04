"use client"
import { useState } from "react"
import type { SessionQuestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function QuizCard({ q, onAnswer }: { q: SessionQuestion; onAnswer: (choice: string) => void }) {
  const [showHint, setShowHint] = useState(false)
  return (
    <Card>
      <CardContent className="p-4">
        <img src={q.imageUrl} alt="" className="w-full aspect-square object-cover rounded-xl" />
        <h2 className="mt-3 text-lg font-semibold">{q.prompt}</h2>
        <div className="mt-3 grid gap-2">
          {q.options.map(opt => (
            <Button key={opt} variant="outline" className="justify-start" onClick={() => onAnswer(opt)}>{opt}</Button>
          ))}
        </div>
        {!showHint
          ? <button className="mt-3 underline text-sm" onClick={() => setShowHint(true)}>Show hint</button>
          : <p className="mt-2 text-sm opacity-80">Hint: {q.hint}</p>}
      </CardContent>
    </Card>
  )
}
