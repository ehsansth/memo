import { Separator } from "@/components/ui/separator"

export default function TopNav() {
  return (
    <header>
      <div className="container mx-auto flex items-center justify-between py-3">
        <h1 className="text-lg font-semibold">memo</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/">Home</a>
          <a href="/caregiver">Caregiver</a>
          <a href="/patient/quiz">Patient</a>
        </nav>
      </div>
      <Separator />
    </header>
  )
}
