import Image from "next/image";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/guards";

export default async function Page() {
  const user = await requireUser().catch(() => null);
  const role = user?.role ?? null;
  const isPatient = role === "PATIENT";
  const isCaregiver = role === "CAREGIVER";
  const isSignedIn = Boolean(user);

  return (
    <main className="relative w-full overflow-x-hidden bg-background text-foreground">
      {/* ===== HERO (Centered Memo) ===== */}
      <section className="mx-auto max-w-xl text-center min-h-[85vh] flex flex-col justify-center">
        <h1 className="text-6xl font-bold">memo.</h1>
        <p className="mt-2 text-2xl font-bold text-muted-foreground">
          preserve what matters the most— memories.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          {!isSignedIn && (
            <Button
              asChild
              className="w-48 py-7 text-xl font-semibold rounded-2xl hover:scale-105 transition"
            >
              <a href="/auth/login?screen_hint=signup">Sign Up</a>
            </Button>
          )}

          {isPatient && (
            <Button
              asChild
              className="w-48 py-7 text-xl font-semibold rounded-2xl hover:scale-105 transition"
            >
              <a href="/patient/quiz">Take Quiz</a>
            </Button>
          )}

          {isCaregiver && (
            <>
              <Button
                asChild
                className="w-48 py-7 text-xl font-semibold rounded-2xl hover:scale-105 transition"
              >
                <a href="/caregiver">Add Memories</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-48 py-7 text-xl font-semibold rounded-2xl hover:scale-105 transition"
              >
                <a href="/caregiver/patients">Patient Insights</a>
              </Button>
            </>
          )}
        </div>
      </section>

           {/* ===== TWO-COLUMN SHOWCASE SECTION ===== */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 px-8 md:px-20 py-8 min-h-[70vh]">
        {/* LEFT TEXT CONTENT */}
        <div className="md:w-1/2 space-y-4 text-left">
          <h2 className="text-4xl font-semibold">Built for smarter memory recall</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            memo uses AI-driven cognitive modeling to strengthen neural recall
            pathways. It’s more than a tool — it’s your digital companion for
            rediscovering precious memories.
          </p>

          <h3 className="text-3xl font-semibold mt-6">Learn through interaction</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every quiz dynamically adapts to match your pace, recall strength,
            and emotions — turning each session into a deeply personalized
            experience.
          </p>
        </div>

        {/* RIGHT IMAGE PLACEHOLDER */}
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-muted/20 border border-muted-foreground/20 rounded-2xl p-4 w-full max-w-md shadow-md">
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/add-memoryss.png"
                alt="Add Memory Screenshot"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>

      </section>

      {/* ===== SECOND SHOWCASE SECTION (Reversed Layout) ===== */}
      <section className="flex flex-col md:flex-row-reverse items-center justify-center gap-10 px-8 md:px-20 py-12 min-h-[70vh]">
        {/* LEFT IMAGE PLACEHOLDER */}
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-muted/20 border border-muted-foreground/20 rounded-2xl p-4 w-full max-w-md shadow-md">
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/insights.png"
                alt="Add Memory Screenshot"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* RIGHT TEXT CONTENT */}
        <div className="md:w-1/2 space-y-4 text-left">
          <h2 className="text-4xl font-semibold">Personalized recall analytics</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Gain insights into which memories you retain best. memo tracks your recall
            patterns and refines learning for lasting cognitive improvement.
          </p>

          <h3 className="text-3xl font-semibold mt-6">Share and connect securely</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your data remains private while allowing safe sharing with caregivers —
            strengthening support through meaningful interaction.
          </p>
        </div>
      </section>

   {/* ===== ABOUT & CONTACT ===== */}
    <section className="min-h-[50vh] flex flex-col md:flex-row items-stretch justify-center gap-6 text-center px-6 py-12" id="contact">
      {/* About */}
      <div className="w-full md:w-1/3 bg-muted/10 border border-muted-foreground/20 rounded-2xl p-8 shadow-md flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-semibold mb-4 tracking-tight">About</h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
          memo merges emotional connection with memory technology — 
          helping individuals strengthen cognitive recall through consistent interaction.
        </p>
      </div>

      {/* Contact */}
      <div className="w-full md:w-1/3 bg-muted/10 border border-muted-foreground/20 rounded-2xl p-8 shadow-md flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-semibold mb-4 tracking-tight">Contact</h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
          Want to collaborate or learn more about memo?{" "}
          <a
            href="mailto:yourname@email.com"
            className="underline underline-offset-2 hover:text-foreground transition-colors duration-200"
          >
            Contact us
          </a>
          .
        </p>
      </div>
    </section>

    </main>
  )
}
