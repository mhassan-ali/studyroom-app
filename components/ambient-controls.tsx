"use client"

import { Volume1, Volume2, VolumeX } from "lucide-react"

type Props = {
  volume: number
  onChange: (v: number) => void
  accent: string
  disabled?: boolean
}

export function AmbientControls({ volume, onChange, accent, disabled }: Props) {
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const pct = Math.round(volume * 100)

  return (
    <div className="flex w-full items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-white/70" aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        disabled={disabled}
        aria-label="Ambient sound volume"
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="sr-volume h-1.5 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: `linear-gradient(to right, ${accent} ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
        }}
      />
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-white/50">{pct}%</span>

      <style jsx>{`
        .sr-volume::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
        .sr-volume::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border: none;
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
