import { Progress } from "@/components/ui/progress"
export default function QuizProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="mb-3">
      <div className="mb-1 text-sm opacity-70">Question {current} / {total}</div>
      <Progress value={pct} />
    </div>
  )
}
