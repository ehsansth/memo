import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Memory } from "@/lib/types";

function formatDate(value?: Date) {
  if (!value) return null;
  try {
    return value.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default function MemoryCard({ m }: { m: Memory }) {
  const createdAt = formatDate(m.createdAt);
  const tags = (m.tagsAI ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <Card>
      <CardContent className="grid gap-3 p-3">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={m.imageUrl}
            alt={m.title || "Memory"}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">{m.title}</h3>
          {m.captionAI && (
            <p className="text-sm text-muted-foreground">{m.captionAI}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {m.personName && (
            <span className="rounded-full border px-2 py-0.5">👤 {m.personName}</span>
          )}
          {m.eventName && (
            <span className="rounded-full border px-2 py-0.5">🎉 {m.eventName}</span>
          )}
          {m.placeName && (
            <span className="rounded-full border px-2 py-0.5">📍 {m.placeName}</span>
          )}
          {m.dateLabel && (
            <span className="rounded-full border px-2 py-0.5">🗓 {m.dateLabel}</span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs uppercase text-muted-foreground">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
        {createdAt && (
          <p className="text-xs text-muted-foreground">Uploaded {createdAt}</p>
        )}
      </CardContent>
    </Card>
  );
}
