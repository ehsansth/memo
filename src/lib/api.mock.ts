import type { Memory, SessionQuestion } from "./types";

const demoCaregiver = "demo-caregiver";
const demoPatient = "demo-patient";

export async function listMemories(): Promise<Memory[]> {
  return [
    {
      id: "1",
      caregiverSub: demoCaregiver,
      patientId: demoPatient,
      title: "Anna's big day",
      imageUrl: "/placeholder.svg",
      personName: "Anna",
      eventName: "Wedding",
      placeName: "Chicago",
      dateLabel: "June 2020",
      captionAI: null,
      tagsAI: "family, wedding",
      createdAt: new Date(),
    },
  ];
}

export async function uploadMemory(_: File, meta: Partial<Memory>) {
  const id = crypto.randomUUID();
  return {
    id,
    caregiverSub: demoCaregiver,
    patientId: demoPatient,
    title: meta.title || "New memory",
    imageUrl: "/placeholder.svg",
    personName: meta.personName ?? null,
    eventName: meta.eventName ?? null,
    placeName: meta.placeName ?? null,
    dateLabel: meta.dateLabel ?? null,
    captionAI: meta.captionAI ?? null,
    tagsAI: meta.tagsAI ?? null,
    createdAt: new Date(),
  } satisfies Memory;
}

export async function startSession() {
  const q = (id: string): SessionQuestion => ({
    id,
    memoryId: id,
    prompt: "Who is this?",
    hint: "Your daughter",
    options: ["Anna", "Mary", "Sophia"],
    imageUrl: "/placeholder.svg",
  })
  return { sessionId: crypto.randomUUID(), questions: [q("1"), q("2"), q("3"), q("4"), q("5")] }
}

export async function answer() {
  const correct = Math.random() > 0.5
  return { correct, reveal: "Correct: Anna", supportive: "Good try—this is Anna, your daughter." }
}
