import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Memory } from "@/lib/types"

export default function MemoryCard({ m }: { m: Memory }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="relative aspect-square">
          <Image
            src={m.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="rounded-xl object-cover"
          />
        </div>
        <div className="mt-2 text-sm">
          {m.personName && <span className="mr-2 rounded-full border px-2 py-0.5">👤 {m.personName}</span>}
          {m.eventName &&  <span className="mr-2 rounded-full border px-2 py-0.5">🎉 {m.eventName}</span>}
          {m.placeName &&  <span className="rounded-full border px-2 py-0.5">📍 {m.placeName}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
