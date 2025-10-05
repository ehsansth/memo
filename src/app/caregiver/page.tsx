import { requireRole } from '@/lib/guards';
import UploadForm from '@/components/caregiver/UploadForm';
import MemoryCard from '@/components/caregiver/MemoryCard';
import { listMemories } from '@/lib/api.mock'; // replace with real API later

export default async function CaregiverPage() {
  await requireRole(['CAREGIVER']); // redirect/throw if not caregiver
  const memories = await listMemories();
  return (
    <div className="grid gap-6">
      <UploadForm />
      <div className="grid gap-4 md:grid-cols-3">
        {memories.map(memory => (
          <MemoryCard key={memory.id} m={memory} />
        ))}
      </div>
    </div>
  );
}
