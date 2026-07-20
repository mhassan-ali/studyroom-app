"use client"

import { cn } from "@/lib/utils"

export function SessionTracker({ completed, accent }: { completed: number; accent: string }) {
  // Show a minimum of 4 dots, growing as more sessions are completed.
  const total = Math.max(4, completed)
  const dots = Array.from({ length: total })

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2" aria-hidden="true">
        {dots.map((_, i) => {
          const filled = i < completed
          return (
            <span
              key={i}
              className={cn("h-2.5 w-2.5 rounded-full transition-all duration-500")}
              style={{
                backgroundColor: filled ? accent : "rgba(255,255,255,0.18)",
                boxShadow: filled ? `0 0 10px ${accent}` : undefined,
              }}
            />
          )
        })}
      </div>
      <p className="text-xs text-white/50">
        {completed === 0
          ? "No focus sessions yet today"
          : `${completed} focus ${completed === 1 ? "session" : "sessions"} completed today`}
      </p>
    </div>
  )
}
