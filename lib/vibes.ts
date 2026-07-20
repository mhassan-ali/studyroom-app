import { CloudRain, TrainFront, BookOpen, Trees, type LucideIcon } from "lucide-react"

export type VibeId = "rain" | "train" | "library" | "forest"

export type Vibe = {
  id: VibeId
  name: string
  tagline: string
  icon: LucideIcon
  /** CSS color stops used for the animated background gradient */
  bg: {
    from: string
    via: string
    to: string
  }
  /** Accent color used for UI highlights while this vibe is active */
  accent: string
  /** Soft foreground/text color that reads well on the vibe background */
  foreground: string
}

export const VIBES: Vibe[] = [
  {
    id: "rain",
    name: "Rainy Café",
    tagline: "Soft rain & warm café murmur",
    icon: CloudRain,
    bg: {
      from: "#4a3826",
      via: "#5c4630",
      to: "#2a1e12",
    },
    accent: "#e0a35c",
    foreground: "#f3e6d2",
  },
  {
    id: "train",
    name: "Night Train",
    tagline: "Steady rumble & distant horns",
    icon: TrainFront,
    bg: {
      from: "#182741",
      via: "#233a63",
      to: "#0d1526",
    },
    accent: "#6f9bd8",
    foreground: "#d9e3f5",
  },
  {
    id: "library",
    name: "Library",
    tagline: "Near silence & turning pages",
    icon: BookOpen,
    bg: {
      from: "#3d2f21",
      via: "#4c3b2a",
      to: "#241a12",
    },
    accent: "#c9a878",
    foreground: "#efe6d8",
  },
  {
    id: "forest",
    name: "Forest",
    tagline: "Birdsong & swaying leaves",
    icon: Trees,
    bg: {
      from: "#1a3a28",
      via: "#255239",
      to: "#0f2418",
    },
    accent: "#7cbd8a",
    foreground: "#dcefe0",
  },
]

export function getVibe(id: VibeId): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES[0]
}
