//memo/src/components/quiz/QuizCard.tsx
"use client"
import Image from "next/image"
import { useState } from "react"
import type { SessionQuestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MuteToggle from "@/components/mute/mute-toggle2" // 👈 import your existing mute toggle

export default function QuizCard({ q, onAnswer }: { q: SessionQuestion; onAnswer: (choice: string) => void }) {
  const [showHint, setShowHint] = useState(false)
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative aspect-square">
          <Image
            src={q.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="rounded-xl object-cover"
          />
        </div>

        {/* 👇 Question text + Mute toggle */}
        <div className="mt-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{q.prompt}</h2>
          <div className="scale-125">
            <MuteToggle /> {/* 👈 mute/unmute button beside question */}
          </div>
        </div>

        {/* Answer options */}
        <div className="mt-3 grid gap-2">
          {q.options.map(opt => (
            <Button
              key={opt}
              variant="outline"
              className="justify-start"
              onClick={() => onAnswer(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>

        {/* Hint section */}
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
          <p className="mt-4 text-sm opacity-80 px-3 py-2 bg-muted rounded-md text-center">
            Hint: {q.hint}
          </p>
        )}

      </CardContent>
    </Card>
  )
}
