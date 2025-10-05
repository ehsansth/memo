import UploadForm from '@/components/caregiver/UploadForm';
import MemoryCard from '@/components/caregiver/MemoryCard';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/guards';
import type { Memory } from '@/lib/types';

export default async function CaregiverPage() {
  const user = await requireRole(['CAREGIVER']);
  const memoriesFromDb = await prisma.memory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const memories: Memory[] = memoriesFromDb.map(memory => ({
    id: memory.id,
    title: memory.title,
    imageUrl: memory.imageUrl,
    personName: memory.personName ?? undefined,
    eventName: memory.eventName ?? undefined,
    placeName: memory.placeName ?? undefined,
  }));

  return (
    <div className="grid gap-6">
      <UploadForm />
      <div className="grid gap-4 md:grid-cols-3">
        {memories.map(memory => (
          <MemoryCard key={memory.id} m={memory} />
        ))}
        {!memories.length && (
          <p className="text-sm text-muted-foreground">Add a photo to start building MemoryBuddy prompts.</p>
        )}
      </div>
    </div>
  );
}
