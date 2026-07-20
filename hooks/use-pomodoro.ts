"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type Mode = "focus" | "break"

type Options = {
  onSessionComplete?: () => void
}

export function usePomodoro({ onSessionComplete }: Options = {}) {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [mode, setMode] = useState<Mode>("focus")
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(25 * 60)
  const [completed, setCompleted] = useState(0)

  const deadlineRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onSessionComplete)
  onCompleteRef.current = onSessionComplete

  const durationFor = useCallback(
    (m: Mode) => (m === "focus" ? focusMinutes : breakMinutes) * 60,
    [focusMinutes, breakMinutes],
  )

  // When durations change while paused, keep the display in sync.
  useEffect(() => {
    if (!running) setRemaining(durationFor(mode))
  }, [durationFor, mode, running])

  const switchMode = useCallback(
    (next: Mode) => {
      setMode(next)
      setRunning(false)
      deadlineRef.current = null
      setRemaining(durationFor(next))
    },
    [durationFor],
  )

  const tick = useCallback(() => {
    if (deadlineRef.current == null) return
    const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000))
    setRemaining(left)

    if (left <= 0) {
      deadlineRef.current = null
      setRunning(false)
      setMode((prev) => {
        if (prev === "focus") {
          setCompleted((c) => c + 1)
          onCompleteRef.current?.()
          const dur = breakMinutes * 60
          setRemaining(dur)
          return "break"
        }
        setRemaining(focusMinutes * 60)
        return "focus"
      })
      return
    }
    rafRef.current = window.setTimeout(tick, 250)
  }, [breakMinutes, focusMinutes])

  const start = useCallback(() => {
    if (running) return
    deadlineRef.current = Date.now() + remaining * 1000
    setRunning(true)
  }, [remaining, running])

  const pause = useCallback(() => {
    setRunning(false)
    deadlineRef.current = null
    if (rafRef.current) window.clearTimeout(rafRef.current)
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    deadlineRef.current = null
    if (rafRef.current) window.clearTimeout(rafRef.current)
    setRemaining(durationFor(mode))
  }, [durationFor, mode])

  useEffect(() => {
    if (running) {
      rafRef.current = window.setTimeout(tick, 250)
    }
    return () => {
      if (rafRef.current) window.clearTimeout(rafRef.current)
    }
  }, [running, tick])

  const total = durationFor(mode)
  const progress = total > 0 ? 1 - remaining / total : 0

  return {
    mode,
    running,
    remaining,
    completed,
    progress,
    focusMinutes,
    breakMinutes,
    setFocusMinutes,
    setBreakMinutes,
    start,
    pause,
    reset,
    switchMode,
  }
}
