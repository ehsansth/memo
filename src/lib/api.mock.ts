import type { Memory, SessionQuestion } from "./types"

export async function listMemories(): Promise<Memory[]> {
  return [{ id: "1", imageUrl: "/placeholder.svg", personName: "Anna", eventName: "Wedding", placeName: "Chicago" }]
}

export async function uploadMemory(_: File, meta: Partial<Memory>) {
  return { id: crypto.randomUUID(), imageUrl: "/placeholder.svg", ...meta }
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
