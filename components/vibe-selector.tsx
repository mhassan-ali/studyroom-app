"use client"

import { VIBES, type VibeId, type Vibe } from "@/lib/vibes"
import { cn } from "@/lib/utils"

type Props = {
  active: VibeId | null
  accent: string
  onSelect: (vibe: Vibe) => void
}

export function VibeSelector({ active, accent, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Choose an ambient vibe"
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md sm:gap-2"
    >
      {VIBES.map((vibe) => {
        const Icon = vibe.icon
        const isActive = active === vibe.id
        return (
          <button
            key={vibe.id}
            role="tab"
            aria-selected={isActive}
            title={vibe.name}
            onClick={() => onSelect(vibe)}
            className={cn(
              "group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 sm:px-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              isActive ? "text-black" : "text-white/70 hover:text-white",
            )}
            style={isActive ? { backgroundColor: accent } : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className={cn("hidden whitespace-nowrap sm:inline", !isActive && "sm:hidden md:inline")}>
              {vibe.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
