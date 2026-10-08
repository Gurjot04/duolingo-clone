"use client";
// Tiny WebAudio sound effects + browser text-to-speech (no audio assets needed).

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  if (typeof window === "undefined") return;
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime + start);
    o.stop(ctx.currentTime + start + dur);
  } catch {}
}

export const sfx = {
  correct: () => { tone(660, 0, 0.12); tone(880, 0.1, 0.2); },
  wrong: () => { tone(220, 0, 0.18, "sawtooth", 0.08); tone(160, 0.15, 0.25, "sawtooth", 0.08); },
  finish: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle")),
  tap: () => tone(500, 0, 0.05, "square", 0.04),
};

export function speak(text: string, lang = "es-ES") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
