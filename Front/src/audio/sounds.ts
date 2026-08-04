/**
 * Sounds are synthesised with the Web Audio API rather than loaded as files: nothing to
 * download, nothing to cache, and the game still sounds right offline once installed.
 *
 * A disc landing on a wooden board is a short bright knock over a low thump. That is exactly
 * what is built here: a filtered noise burst for the click of the shell, a sine for the wood.
 */

let context: AudioContext | null = null
let enabled = true

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (context === null) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (Ctor === undefined) {
      return null
    }

    context = new Ctor()
  }

  // Browsers start the context suspended until a user gesture.
  if (context.state === 'suspended') {
    void context.resume()
  }

  return context
}

export function setSoundEnabled(value: boolean) {
  enabled = value
}

export function isSoundEnabled(): boolean {
  return enabled
}

/** Short burst of filtered noise: the shell of the disc hitting the board. */
function knock(when: number, frequency: number, gainValue: number, duration: number) {
  const audio = ensureContext()

  if (audio === null) {
    return
  }

  const frames = Math.floor(audio.sampleRate * duration)
  const buffer = audio.createBuffer(1, frames, audio.sampleRate)
  const samples = buffer.getChannelData(0)

  for (let i = 0; i < frames; i++) {
    // Exponential decay keeps the burst dry, like wood rather than metal.
    samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3)
  }

  const source = audio.createBufferSource()
  source.buffer = buffer

  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = 1.4

  const gain = audio.createGain()
  gain.gain.value = gainValue

  source.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  source.start(when)
}

/** Low body of the impact: the board itself resonating. */
function thump(when: number, frequency: number, gainValue: number, duration: number) {
  const audio = ensureContext()

  if (audio === null) {
    return
  }

  const oscillator = audio.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, when)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.55, when + duration)

  const gain = audio.createGain()
  gain.gain.setValueAtTime(gainValue, when)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(when)
  oscillator.stop(when + duration + 0.02)
}

/** A short bell-like note: quick attack, fast decay. The musical layer over the wood. */
function chime(when: number, frequency: number, gainValue: number, duration: number) {
  const audio = ensureContext()

  if (audio === null) {
    return
  }

  const oscillator = audio.createOscillator()
  oscillator.type = 'triangle'
  oscillator.frequency.value = frequency

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)

  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(when)
  oscillator.stop(when + duration + 0.02)
}

/** A disc being placed: the loudest sound of the game, and the most satisfying. */
export function playPlace() {
  if (!enabled) {
    return
  }

  const audio = ensureContext()

  if (audio === null) {
    return
  }

  // A hair of detune per hit, so two identical moves never sound machine-stamped.
  const now = audio.currentTime
  const detune = 0.94 + Math.random() * 0.12

  knock(now, 2200 * detune, 0.42, 0.028)
  knock(now + 0.014, 1350 * detune, 0.3, 0.05)
  thump(now, 205 * detune, 0.42, 0.09)
}

/** Beyond this, a wave of flips turns into noise rather than feedback. */
export const MAX_FLIP_SOUNDS = 5

/** Pentatonic steps: any subset sounds consonant, so a wave of flips becomes a little run. */
const FLIP_SCALE = [523.25, 587.33, 659.25, 783.99, 880.0]

/**
 * A disc landing back on its other face: the dry tick of the wood, plus one rising note per
 * disc. A long capture literally plays a melody going up — the reward grows with the take.
 */
export function playFlip(index = 0, slow = false) {
  if (!enabled || index >= MAX_FLIP_SOUNDS) {
    return
  }

  const audio = ensureContext()

  if (audio === null) {
    return
  }

  // The tick has to land when the disc does, so it follows the same pacing as the animation:
  // the drop and the announcement first, then one disc per ring.
  const lead = slow ? 1.38 : 0.88
  const step = slow ? 0.19 : 0.13
  const at = audio.currentTime + lead + index * step
  const detune = 0.97 + Math.random() * 0.06

  knock(at, 1500 * detune, 0.15, 0.03)
  thump(at, 185 * detune, 0.12, 0.05)
  chime(at + 0.018, FLIP_SCALE[index], 0.055, 0.19)
}

/** Soft tick used when a menu choice changes. */
export function playTick() {
  if (!enabled) {
    return
  }

  const audio = ensureContext()

  if (audio === null) {
    return
  }

  knock(audio.currentTime, 2400, 0.09, 0.02)
}

/** Rising three note figure at the end of a game. */
export function playFanfare(win: boolean) {
  if (!enabled) {
    return
  }

  const audio = ensureContext()

  if (audio === null) {
    return
  }

  const now = audio.currentTime
  const notes = win ? [392, 523, 659] : [392, 330, 262]

  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency

    const gain = audio.createGain()
    const at = now + index * 0.095
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.15, at + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2)

    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start(at)
    oscillator.stop(at + 0.22)
  })
}
