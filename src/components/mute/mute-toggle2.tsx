//memo/src/components/mute/mute-toggle2.tsx
"use client"

import { useState } from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MuteToggle2() {
  const [active, setActive] = useState(false)

  const handleClick = () => {
    setActive(true)
    setTimeout(() => setActive(false), 2000) // turn off after 1 second
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={active ? "Reading..." : "Read aloud"}
      className={`
        transition-all duration-600
        ${
          active
            ? "bg-accent text-accent-foreground hover:bg-accent dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent"
            : "bg-transparent text-neutral-800 dark:text-neutral-100 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
        }
      `}
    >
      <Volume2 className="h-5 w-5 transition-transform duration-300 transform hover:scale-110" />
    </Button>
  )
}
