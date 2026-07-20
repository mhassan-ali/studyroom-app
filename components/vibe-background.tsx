"use client"

import { useEffect, useMemo, useState } from "react"
import type { Vibe } from "@/lib/vibes"

/** Deterministic pseudo-random so SSR and client markup match (no hydration warnings). */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function RainLayer() {
  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: seeded(i, 1) * 100,
        delay: seeded(i, 2) * 4,
        duration: 0.6 + seeded(i, 3) * 0.8,
        height: 40 + seeded(i, 4) * 60,
        opacity: 0.15 + seeded(i, 5) * 0.25,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {drops.map((d, i) => (
        <span
          key={i}
          className="absolute top-0 w-px rounded-full"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.7))",
            opacity: d.opacity,
            animation: `sr-rain-fall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }}
      />
    </div>
  )
}

function TrainLayer() {
  const streaks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        top: 8 + seeded(i, 1) * 70,
        delay: seeded(i, 2) * 8,
        duration: 2.2 + seeded(i, 3) * 3,
        width: 60 + seeded(i, 4) * 180,
        thickness: 1 + Math.round(seeded(i, 5) * 2),
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {streaks.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${s.top}%`,
            width: `${s.width}px`,
            height: `${s.thickness}px`,
            background: "linear-gradient(to left, rgba(160,190,240,0.9), transparent)",
            filter: "blur(0.5px)",
            animation: `sr-light-streak ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 120%, rgba(90,120,180,0.18), transparent 60%)" }}
      />
    </div>
  )
}

function LibraryLayer() {
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: seeded(i, 1) * 100,
        top: 20 + seeded(i, 2) * 70,
        delay: seeded(i, 3) * 10,
        duration: 8 + seeded(i, 4) * 8,
        size: 1 + seeded(i, 5) * 2,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* warm shelf glow, essentially still */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 30% 20%, rgba(220,180,120,0.14), transparent 55%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 80% 80%, rgba(180,130,80,0.12), transparent 50%)" }}
      />
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            background: "rgba(240,220,180,0.8)",
            animation: `sr-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function ForestLayer() {
  const trees = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const swayAmount = 1 + seeded(i, 6) * 1.5
        return {
          left: (i / 9) * 100 + seeded(i, 1) * 6,
          height: 30 + seeded(i, 2) * 34,
          width: 8 + seeded(i, 3) * 8,
          delay: seeded(i, 4) * 4,
          duration: 4 + seeded(i, 5) * 3,
          swayFrom: `${-swayAmount}deg`,
          swayTo: `${swayAmount}deg`,
          shade: 0.55 + seeded(i, 7) * 0.35,
        }
      }),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(150,200,150,0.12), transparent 55%)" }}
      />
      {trees.map((t, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={
            {
              left: `${t.left}%`,
              width: `${t.width}vw`,
              height: `${t.height}vh`,
              transformOrigin: "bottom center",
              "--sway-from": t.swayFrom,
              "--sway-to": t.swayTo,
              animation: `sr-sway ${t.duration}s ease-in-out ${t.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${t.width * 2}vw solid transparent`,
              borderRight: `${t.width * 2}vw solid transparent`,
              borderBottom: `${t.height}vh solid rgba(10,30,18,${t.shade})`,
            }}
          />
        </div>
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-1/4"
        style={{ background: "linear-gradient(to top, rgba(5,20,12,0.6), transparent)" }}
      />
    </div>
  )
}

export function VibeBackground({ vibe }: { vibe: Vibe }) {
  // Decorative layers use non-integer positioning that the browser normalizes
  // differently between SSR and client, so we only mount them after hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div
      key={vibe.id}
      className="sr-animate-in absolute inset-0 z-0"
      style={{
        background: `linear-gradient(160deg, ${vibe.bg.from} 0%, ${vibe.bg.via} 55%, ${vibe.bg.to} 100%)`,
      }}
    >
      {mounted && vibe.id === "rain" && <RainLayer />}
      {mounted && vibe.id === "train" && <TrainLayer />}
      {mounted && vibe.id === "library" && <LibraryLayer />}
      {mounted && vibe.id === "forest" && <ForestLayer />}
    </div>
  )
}
