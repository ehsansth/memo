"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Memory } from "@/lib/types"

type MemoryMetadata = Pick<Memory, "personName" | "eventName" | "placeName">

type UploadFormProps = {
  onCreate?: (file: File, meta: MemoryMetadata) => void
}

export default function UploadForm({ onCreate }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [personName, setPerson] = useState("")
  const [eventName, setEvent] = useState("")
  const [placeName, setPlace] = useState("")

  return (
    <div className="rounded-2xl border p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Photo</Label>
          <Input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="grid gap-3">
          <div><Label>Person</Label><Input value={personName} onChange={e=>setPerson(e.target.value)} placeholder="Anna" /></div>
          <div><Label>Event</Label><Input value={eventName} onChange={e=>setEvent(e.target.value)} placeholder="Wedding" /></div>
          <div><Label>Place</Label><Input value={placeName} onChange={e=>setPlace(e.target.value)} placeholder="Chicago" /></div>
        </div>
      </div>
      <Button
        className="mt-4"
        disabled={!file}
        onClick={() => {
          if (file) onCreate?.(file, { personName, eventName, placeName })
        }}
      >
        Save memory
      </Button>
    </div>
  )
}
