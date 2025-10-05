//memo/src/components/quiz/QuizProgress.tsx
import { Progress } from "@/components/ui/progress"

export default function QuizProgress({ current, total }: { current: number; total: number }) {
  // Make sure it only reaches 100% after final question
  const pct = Math.min(100, Math.round(((current - 1) / total) * 100))

  return (
    <div className="mb-3">
      <div className="mb-1 text-sm opacity-70">
        Question {current} / {total}
      </div>
      <Progress
        value={pct}
        className="[&>div]:transition-all [&>div]:duration-700 [&>div]:ease-in-out"
      />
    </div>
  )
}
