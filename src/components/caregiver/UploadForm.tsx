"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Memory } from "@/lib/types"

type MemoryMetadata = Pick<Memory, "personName" | "eventName" | "placeName">

type UploadFormProps = {
  onCreate?: (file: File, meta: MemoryMetadata) => void
}

export default function UploadForm({ onCreate }: UploadFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [personName, setPerson] = useState("")
  const [eventName, setEvent] = useState("")
  const [placeName, setPlace] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!file) return
    const meta = { personName, eventName, placeName }

    if (onCreate) {
      onCreate(file, meta)
      return
    }

    const nameForTitle = title.trim() || personName.trim() || eventName.trim() || "Memory"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", nameForTitle)
    if (personName) formData.append("personName", personName)
    if (eventName) formData.append("eventName", eventName)
    if (placeName) formData.append("placeName", placeName)

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "Upload failed")
      }
      setTitle("")
      setPerson("")
      setEvent("")
      setPlace("")
      setFile(null)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Photo</Label>
          <Input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="grid gap-3">
          <div><Label>Title</Label><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Anna's big day" /></div>
          <div><Label>Person</Label><Input value={personName} onChange={e=>setPerson(e.target.value)} placeholder="Anna" /></div>
          <div><Label>Event</Label><Input value={eventName} onChange={e=>setEvent(e.target.value)} placeholder="Wedding" /></div>
          <div><Label>Place</Label><Input value={placeName} onChange={e=>setPlace(e.target.value)} placeholder="Chicago" /></div>
        </div>
      </div>
      <Button
        className="mt-4"
        disabled={!file || submitting}
        onClick={handleCreate}
      >
        {submitting ? "Saving…" : "Save memory"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
