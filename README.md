# Study Room

A calm, single-screen ambient study companion. Pick a vibe to get a looping,
procedurally-generated soundscape paired with a matching animated backdrop, and
stay on track with a built-in Pomodoro timer. Everything runs entirely in the
browser — no backend, no accounts, no audio files to download.

## Features   

- **Four ambient vibes** — Rainy Café, Night Train, Library, and Forest. Each
  pairs its own soundscape with a distinct animated background and accent color.
- **Procedural audio** — soundscapes are synthesized live with the Web Audio
  API. No audio files means seamless, gapless loops and no licensing concerns.
  Sound only starts on a user interaction (selecting a vibe), so it never
  violates browser autoplay policies.
- **Pomodoro timer** — a centered countdown ring with start / pause / reset,
  adjustable focus and break lengths, and session dots that fill as you complete
  focus blocks. A gentle chime and a "Break time" banner mark each transition.
- **Independent ambient volume** — control the soundscape level separately from
  the timer.
- **Smooth transitions** — switching vibes crossfades both the audio layers and
  the visuals.
- **Responsive & accessible** — adapts from desktop to mobile, honors
  `prefers-reduced-motion`, and uses semantic, keyboard-friendly controls.

## Tech Stack 

- **Next.js** (App Router) + **React**
- **TypeScript**
- **Tailwind CSS** for styling and the ambient animations
- **Web Audio API** for real-time sound synthesis
- **lucide-react** for icons

## Getting Started

Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How It Works

- `lib/vibes.ts` — configuration for each vibe (name, icon, gradient colors,
  accent, and foreground).
- `lib/audio-engine.ts` — the Web Audio API engine that synthesizes and
  crossfades the ambient layers for each vibe.
- `hooks/use-pomodoro.ts` — the Pomodoro timer state machine (focus/break
  cycles, session counting, transitions).
- `components/study-room.tsx` — the top-level container that wires the audio
  engine, timer, and UI together.
- `components/vibe-background.tsx` — the animated per-vibe backdrops.
- `components/vibe-selector.tsx`, `components/pomodoro-timer.tsx`,
  `components/ambient-controls.tsx`, `components/session-tracker.tsx` — the
  individual UI pieces.

## Project Structure

```
app/
  layout.tsx        # Metadata, fonts, base theme
  page.tsx          # Renders <StudyRoom />
  globals.css       # Theme tokens + ambient animations
components/
  study-room.tsx
  vibe-background.tsx
  vibe-selector.tsx
  pomodoro-timer.tsx
  ambient-controls.tsx
  session-tracker.tsx
hooks/
  use-pomodoro.ts
lib/
  vibes.ts
  audio-engine.ts
```

## Notes

Audio requires a user gesture to begin, which is why the soundscape starts only
after you select a vibe. If you have reduced-motion enabled at the OS level, the
background animations are minimized automatically .
