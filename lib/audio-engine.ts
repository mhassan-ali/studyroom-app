import type { VibeId } from "./vibes"

/**
 * A fully procedural ambient sound engine built on the Web Audio API.
 * No audio files are loaded — every soundscape is synthesized in-browser,
 * loops seamlessly, and can be crossfaded between vibes.
 *
 * Audio only starts after an explicit user gesture (calling `setVibe`),
 * which keeps us on the right side of browser autoplay restrictions.
 */

type Layer = {
  gain: GainNode
  nodes: AudioNode[]
  sources: AudioScheduledSourceNode[]
  timers: number[]
}

const FADE = 0.9 // crossfade time in seconds

export class AmbientEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private layer: Layer | null = null
  private whiteBuffer: AudioBuffer | null = null
  private brownBuffer: AudioBuffer | null = null
  private volume = 0.6
  currentVibe: VibeId | null = null

  private ensureContext() {
    if (this.ctx) return
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(this.ctx.destination)
    this.whiteBuffer = this.createWhiteNoise(this.ctx)
    this.brownBuffer = this.createBrownNoise(this.ctx)
  }

  private createWhiteNoise(ctx: AudioContext): AudioBuffer {
    const len = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  private createBrownNoise(ctx: AudioContext): AudioBuffer {
    const len = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    return buffer
  }

  private noiseSource(buffer: AudioBuffer): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource()
    src.buffer = buffer
    src.loop = true
    return src
  }

  /** Switch to a vibe, crossfading from whatever is currently playing. */
  async setVibe(vibe: VibeId) {
    this.ensureContext()
    if (this.ctx!.state === "suspended") await this.ctx!.resume()

    // Fade out and tear down the previous layer.
    if (this.layer) this.disposeLayer(this.layer)

    const layer = this.buildLayer(vibe)
    this.layer = layer
    this.currentVibe = vibe

    // Fade the new layer in.
    const now = this.ctx!.currentTime
    layer.gain.gain.setValueAtTime(0.0001, now)
    layer.gain.gain.exponentialRampToValueAtTime(1, now + FADE)
  }

  private disposeLayer(layer: Layer) {
    const now = this.ctx!.currentTime
    layer.gain.gain.cancelScheduledValues(now)
    layer.gain.gain.setValueAtTime(Math.max(layer.gain.gain.value, 0.0001), now)
    layer.gain.gain.exponentialRampToValueAtTime(0.0001, now + FADE)
    layer.timers.forEach((t) => window.clearTimeout(t))
    const stopAt = now + FADE + 0.05
    layer.sources.forEach((s) => {
      try {
        s.stop(stopAt)
      } catch {
        /* already stopped */
      }
    })
    window.setTimeout(() => {
      try {
        layer.gain.disconnect()
      } catch {
        /* noop */
      }
    }, (FADE + 0.2) * 1000)
  }

  private buildLayer(vibe: VibeId): Layer {
    const ctx = this.ctx!
    const gain = ctx.createGain()
    gain.connect(this.master!)
    const layer: Layer = { gain, nodes: [gain], sources: [], timers: [] }

    switch (vibe) {
      case "rain":
        this.buildRain(layer)
        break
      case "train":
        this.buildTrain(layer)
        break
      case "library":
        this.buildLibrary(layer)
        break
      case "forest":
        this.buildForest(layer)
        break
    }
    return layer
  }

  // ---- Vibe builders -------------------------------------------------------

  private buildRain(layer: Layer) {
    const ctx = this.ctx!
    // Rain hiss: white noise through a high-pass with a gentle shimmer LFO.
    const rain = this.noiseSource(this.whiteBuffer!)
    const hp = ctx.createBiquadFilter()
    hp.type = "highpass"
    hp.frequency.value = 900
    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.16
    rain.connect(hp).connect(rainGain).connect(layer.gain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.04
    lfo.connect(lfoGain).connect(rainGain.gain)

    // Warm café murmur: brown noise rolled off low.
    const cafe = this.noiseSource(this.brownBuffer!)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 450
    const cafeGain = ctx.createGain()
    cafeGain.gain.value = 0.09
    cafe.connect(lp).connect(cafeGain).connect(layer.gain)

    rain.start()
    cafe.start()
    lfo.start()
    layer.sources.push(rain, cafe, lfo)
    layer.nodes.push(hp, rainGain, lfoGain, lp, cafeGain)
  }

  private buildTrain(layer: Layer) {
    const ctx = this.ctx!
    // Deep rumble: brown noise low-passed with a slow breathing LFO.
    const rumble = this.noiseSource(this.brownBuffer!)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 110
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.3
    rumble.connect(lp).connect(rumbleGain).connect(layer.gain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.28
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.08
    lfo.connect(lfoGain).connect(rumbleGain.gain)

    // Rhythmic clack of the tracks.
    const clack = this.noiseSource(this.whiteBuffer!)
    const clackFilter = ctx.createBiquadFilter()
    clackFilter.type = "bandpass"
    clackFilter.frequency.value = 220
    const clackGain = ctx.createGain()
    clackGain.gain.value = 0
    clack.connect(clackFilter).connect(clackGain).connect(layer.gain)
    const clackLfo = ctx.createOscillator()
    clackLfo.type = "sawtooth"
    clackLfo.frequency.value = 1.6
    const clackLfoGain = ctx.createGain()
    clackLfoGain.gain.value = 0.05
    clackLfo.connect(clackLfoGain).connect(clackGain.gain)

    rumble.start()
    lfo.start()
    clack.start()
    clackLfo.start()
    layer.sources.push(rumble, lfo, clack, clackLfo)
    layer.nodes.push(lp, rumbleGain, lfoGain, clackFilter, clackGain, clackLfoGain)

    // Distant horn every so often.
    const scheduleHorn = () => {
      const delay = 18000 + Math.random() * 22000
      const t = window.setTimeout(() => {
        this.playHorn(layer)
        scheduleHorn()
      }, delay)
      layer.timers.push(t)
    }
    scheduleHorn()
  }

  private playHorn(layer: Layer) {
    const ctx = this.ctx!
    const now = ctx.currentTime
    const hornGain = ctx.createGain()
    hornGain.gain.setValueAtTime(0.0001, now)
    hornGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2)
    hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 4)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 700
    hornGain.connect(lp).connect(layer.gain)
    // Two detuned tones a minor third apart for a mournful horn.
    ;[196, 233].forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = "sawtooth"
      osc.frequency.value = freq
      osc.connect(hornGain)
      osc.start(now)
      osc.stop(now + 4.2)
    })
  }

  private buildLibrary(layer: Layer) {
    const ctx = this.ctx!
    // Very quiet room tone.
    const room = this.noiseSource(this.brownBuffer!)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 220
    const roomGain = ctx.createGain()
    roomGain.gain.value = 0.03
    room.connect(lp).connect(roomGain).connect(layer.gain)
    room.start()
    layer.sources.push(room)
    layer.nodes.push(lp, roomGain)

    // Occasional page turns / pencil strokes.
    const schedule = () => {
      const delay = 6000 + Math.random() * 12000
      const t = window.setTimeout(() => {
        if (Math.random() > 0.5) this.playPageTurn(layer)
        else this.playPencil(layer)
        schedule()
      }, delay)
      layer.timers.push(t)
    }
    schedule()
  }

  private playPageTurn(layer: Layer) {
    const ctx = this.ctx!
    const now = ctx.currentTime
    const src = this.noiseSource(this.whiteBuffer!)
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 2600
    bp.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(0.08, now + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    src.connect(bp).connect(g).connect(layer.gain)
    src.start(now)
    src.stop(now + 0.4)
  }

  private playPencil(layer: Layer) {
    const ctx = this.ctx!
    const now = ctx.currentTime
    const src = this.noiseSource(this.whiteBuffer!)
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 1500
    bp.Q.value = 2
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(0.04, now + 0.03)
    g.gain.linearRampToValueAtTime(0.03, now + 0.18)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
    src.connect(bp).connect(g).connect(layer.gain)
    src.start(now)
    src.stop(now + 0.35)
  }

  private buildForest(layer: Layer) {
    const ctx = this.ctx!
    // Wind: white noise low-passed with a wandering cutoff.
    const wind = this.noiseSource(this.whiteBuffer!)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.value = 500
    const windGain = ctx.createGain()
    windGain.gain.value = 0.1
    wind.connect(lp).connect(windGain).connect(layer.gain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 250
    lfo.connect(lfoGain).connect(lp.frequency)

    wind.start()
    lfo.start()
    layer.sources.push(wind, lfo)
    layer.nodes.push(lp, windGain, lfoGain)

    // Birdsong at random intervals.
    const scheduleBird = () => {
      const delay = 2500 + Math.random() * 6000
      const t = window.setTimeout(() => {
        this.playBird(layer)
        scheduleBird()
      }, delay)
      layer.timers.push(t)
    }
    scheduleBird()
  }

  private playBird(layer: Layer) {
    const ctx = this.ctx!
    const chirps = 1 + Math.floor(Math.random() * 3)
    const base = 1800 + Math.random() * 1400
    for (let i = 0; i < chirps; i++) {
      const start = ctx.currentTime + i * 0.14
      const osc = ctx.createOscillator()
      osc.type = "sine"
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(0.05, start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)
      osc.frequency.setValueAtTime(base, start)
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, start + 0.06)
      osc.frequency.exponentialRampToValueAtTime(base * 1.1, start + 0.12)
      osc.connect(g).connect(layer.gain)
      osc.start(start)
      osc.stop(start + 0.16)
    }
  }

  // ---- Controls ------------------------------------------------------------

  setVolume(v: number) {
    this.volume = v
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05)
    }
  }

  /** A gentle three-note chime for the end of a session. */
  playChime() {
    this.ensureContext()
    const ctx = this.ctx!
    if (ctx.state === "suspended") ctx.resume()
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      osc.type = "sine"
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(0.18, start + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.6)
      osc.frequency.value = freq
      osc.connect(g).connect(this.master!)
      osc.start(start)
      osc.stop(start + 1.7)
    })
  }

  stop() {
    if (this.layer) {
      this.disposeLayer(this.layer)
      this.layer = null
    }
    this.currentVibe = null
  }

  dispose() {
    this.stop()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
      this.master = null
    }
  }
}
