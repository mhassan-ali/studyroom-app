"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Coffee } from "lucide-react"
import { AmbientEngine } from "@/lib/audio-engine"
import { VIBES, getVibe, type Vibe, type VibeId } from "@/lib/vibes"
import { usePomodoro } from "@/hooks/use-pomodoro"
import { VibeBackground } from "@/components/vibe-background"
import { VibeSelector } from "@/components/vibe-selector"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { AmbientControls } from "@/components/ambient-controls"
import { SessionTracker } from "@/components/session-tracker"

export function StudyRoom() {
  const engineRef = useRef<AmbientEngine | null>(null)
  const [activeVibe, setActiveVibe] = useState<VibeId | null>(null)
  const [volume, setVolume] = useState(0.6)
  const [breakBanner, setBreakBanner] = useState(false)
  const bannerTimer = useRef<number | null>(null)

  // The backdrop always shows something pleasant; default to the first vibe.
  const displayVibe: Vibe = activeVibe ? getVibe(activeVibe) : VIBES[0]

  const handleSessionComplete = useCallback(() => {
    engineRef.current?.playChime()
    setBreakBanner(true)
    if (bannerTimer.current) window.clearTimeout(bannerTimer.current)
    bannerTimer.current = window.setTimeout(() => setBreakBanner(false), 2800)
  }, [])

  const timer = usePomodoro({ onSessionComplete: handleSessionComplete })

  useEffect(() => {
    engineRef.current = new AmbientEngine()
    return () => {
      engineRef.current?.dispose()
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current)
    }
  }, [])

  const selectVibe = useCallback((vibe: Vibe) => {
    setActiveVibe(vibe.id)
    void engineRef.current?.setVibe(vibe.id)
  }, [])

  const handleVolume = useCallback((v: number) => {
    setVolume(v)
    engineRef.current?.setVolume(v)
  }, [])

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0b0e14] text-white">
      <VibeBackground vibe={displayVibe} />

      {/* Header + vibe selector */}
      <header className="relative z-10 flex flex-col items-center gap-5 px-4 pt-6 sm:pt-8">
        <div className="flex items-center gap-2 text-white/80">
          <Coffee className="h-5 w-5" style={{ color: displayVibe.accent }} aria-hidden="true" />
          <h1 className="text-lg font-medium tracking-tight">Study Room</h1>
        </div>
        <VibeSelector active={activeVibe} accent={displayVibe.accent} onSelect={selectVibe} />
      </header>

      {/* Center stage */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <PomodoroTimer
          mode={timer.mode}
          running={timer.running}
          remaining={timer.remaining}
          progress={timer.progress}
          accent={displayVibe.accent}
          focusMinutes={timer.focusMinutes}
          breakMinutes={timer.breakMinutes}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onSwitchMode={timer.switchMode}
          onFocusChange={timer.setFocusMinutes}
          onBreakChange={timer.setBreakMinutes}
        />

        <SessionTracker completed={timer.completed} accent={displayVibe.accent} />
      </div>

      {/* Footer: volume + hint */}
      <footer className="relative z-10 flex flex-col items-center gap-3 px-4 pb-8">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
          <AmbientControls volume={volume} onChange={handleVolume} accent={displayVibe.accent} />
        </div>
        {!activeVibe && (
          <p className="sr-animate-in text-center text-xs text-white/50">
            Pick a vibe above to start the ambient sounds
          </p>
        )}
      </footer>

      {/* Break-time banner */}
      {breakBanner && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="sr-animate-in flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-10 py-8 text-center backdrop-blur-xl"
            role="status"
          >
            <span className="text-4xl font-light tracking-tight text-white text-balance">Break time</span>
            <span className="text-sm text-white/70">Nice work — step away for a moment.</span>
          </div>
        </div>
      )}
    </main>
  )
}
