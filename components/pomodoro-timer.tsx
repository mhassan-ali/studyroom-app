"use client"

import { useState } from "react"
import { Play, Pause, RotateCcw, Settings2, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mode } from "@/hooks/use-pomodoro"

type Props = {
  mode: Mode
  running: boolean
  remaining: number
  progress: number
  accent: string
  focusMinutes: number
  breakMinutes: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSwitchMode: (mode: Mode) => void
  onFocusChange: (m: number) => void
  onBreakChange: (m: number) => void
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 5))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-14 text-center text-sm font-medium tabular-nums text-white">{value} min</span>
        <button
          onClick={() => onChange(Math.min(max, value + 5))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function PomodoroTimer({
  mode,
  running,
  remaining,
  progress,
  accent,
  focusMinutes,
  breakMinutes,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
  onFocusChange,
  onBreakChange,
}: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const radius = 130
  const circumference = 2 * Math.PI * radius
  const dash = circumference * progress

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode switch */}
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
        {(["focus", "break"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => onSwitchMode(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              mode === m ? "text-black" : "text-white/60 hover:text-white",
            )}
            style={mode === m ? { backgroundColor: accent } : undefined}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Countdown ring */}
      <div className="relative flex items-center justify-center">
        <svg width={300} height={300} viewBox="0 0 300 300" className="-rotate-90">
          <circle cx="150" cy="150" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-light tabular-nums tracking-tight text-white sm:text-7xl">
            {format(remaining)}
          </span>
          <span className="mt-2 text-sm uppercase tracking-[0.2em] text-white/50">
            {mode === "focus" ? "Focus" : "Break"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          aria-label="Reset timer"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={running ? onPause : onStart}
          aria-label={running ? "Pause timer" : "Start timer"}
          className="flex h-16 w-16 items-center justify-center rounded-full text-black shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          style={{ backgroundColor: accent }}
        >
          {running ? <Pause className="h-7 w-7" /> : <Play className="ml-0.5 h-7 w-7" />}
        </button>

        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Timer settings"
          aria-expanded={showSettings}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            showSettings && "bg-white/10",
          )}
        >
          <Settings2 className="h-5 w-5" />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="sr-animate-in flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <Stepper label="Focus length" value={focusMinutes} onChange={onFocusChange} min={5} max={90} />
          <Stepper label="Break length" value={breakMinutes} onChange={onBreakChange} min={5} max={30} />
        </div>
      )}
    </div>
  )
}
