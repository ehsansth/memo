"use client"

import { useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MuteToggle() {
  const [muted, setMuted] = useState(false)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMuted(!muted)}
      className="rounded-40px hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-neutral-800 dark:text-neutral-100" />
      ) : (
        <Volume2 className="h-5 w-5 text-neutral-800 dark:text-neutral-100" />
      )}
    </Button>
  )
}
