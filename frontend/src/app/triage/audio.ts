let audioCtx: AudioContext | null = null

export function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

// stack 2 oscillator (หลัก + octave บน) + compressor เพื่อดันความดังสูงสุดโดยไม่แตก
function beep(ctx: AudioContext, freq: number, type: OscillatorType, start: number, dur: number) {
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -10
  comp.ratio.value = 20
  comp.connect(ctx.destination)

  const g = ctx.createGain()
  g.gain.setValueAtTime(3.0, start)
  g.gain.exponentialRampToValueAtTime(0.001, start + dur)
  g.connect(comp)

  for (const f of [freq, freq * 2]) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = f
    osc.connect(g)
    osc.start(start); osc.stop(start + dur)
  }
}

// เสียง ERAlert: square 880Hz ดัง beep 3 ครั้ง
export function playERBeep() {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    beep(ctx, 880, 'square', t,        0.25)
    beep(ctx, 880, 'square', t + 0.35, 0.25)
    beep(ctx, 880, 'square', t + 0.70, 0.25)
  } catch {}
}

// เสียง Null Type: square 440Hz ดัง beep 3 ครั้ง
export function playNullBeep() {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    beep(ctx, 440, 'square', t,        0.3)
    beep(ctx, 440, 'square', t + 0.45, 0.3)
    beep(ctx, 440, 'square', t + 0.90, 0.3)
  } catch {}
}
