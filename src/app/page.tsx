import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <section className="mx-auto max-w-xl text-center">
      <h1 className="mt-8 text-3xl font-bold">memo</h1>
      <p className="mt-2 text-muted-foreground">
        Reinforcing cherished memories through gentle AI-assisted therapy.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="outline"><a href="/caregiver">Caregiver</a></Button>
        <Button asChild><a href="/patient/quiz">Patient</a></Button>
      </div>
    </section>
  )
}
