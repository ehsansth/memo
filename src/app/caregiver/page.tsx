import UploadForm from "@/components/caregiver/UploadForm";
import MemoryCard from "@/components/caregiver/MemoryCard";
import { requireRole } from "@/lib/guards";
import { listMemoriesByOwner } from "@/lib/db-firestore";
import type { Memory, MemoryDoc } from "@/lib/types";

export default async function CaregiverPage() {
  const user = await requireRole(["CAREGIVER"]);
  const ownerSub = user.auth0Id || user.id;
  const docs = await listMemoriesByOwner(ownerSub);
  const memories: Memory[] = docs.map((doc: MemoryDoc & { id: string }) => ({
    id: doc.id,
    title: doc.title || "Memory",
    imageUrl: doc.imageUrl,
    personName: doc.personName ?? null,
    eventName: doc.eventName ?? null,
    placeName: doc.placeName ?? null,
    captionAI: doc.captionAI ?? null,
    tagsAI: doc.tagsAI ?? null,
    embedding: doc.embedding ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return (
    <div className="grid gap-6">
      <UploadForm />
      <div className="grid gap-4 md:grid-cols-3">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} m={memory} />
        ))}
        {!memories.length && <div>No memories yet.</div>}
      </div>
    </div>
  );
}
