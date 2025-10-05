import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <section className="mx-auto max-w-xl text-center">
      <h1 className="mt-45 text-6xl font-bold">memo</h1>
      <p className="mt-2 text-2xl font-bold text-muted-foreground">
        Remember better, using AI-assisted recalling.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4">
        <Button asChild className="w-48 py-8 text-xl font-semibold rounded-2xl hover:scale-105 transition">
          <a href="/patient/quiz">Patient</a>
        </Button>

        <Button asChild variant="outline" className="w-48 py-8 text-xl font-semibold rounded-2xl hover:scale-105 transition">
          <a href="/caregiver">Caregiver</a>
        </Button>
      </div>
    </section>
  )
}
