"use client"
import { useEffect, useState } from "react"
import { listMemories, uploadMemory } from "@/lib/api.mock"
import UploadForm from "@/components/caregiver/UploadForm"
import MemoryCard from "@/components/caregiver/MemoryCard"
import type { Memory } from "@/lib/types"
import { toast } from "sonner"

export default function CaregiverPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  useEffect(() => { listMemories().then(setMemories) }, [])

  async function handleCreate(file: File, meta: Partial<Memory>) {
    const m = await uploadMemory(file, meta)
    setMemories(prev => [m, ...prev])
    toast.success("Memory saved")
  }

  return (
    <div className="grid gap-6">
      <UploadForm onCreate={handleCreate} />
      <div className="grid gap-4 md:grid-cols-3">
        {memories.map(m => <MemoryCard key={m.id} m={m} />)}
      </div>
    </div>
  )
}