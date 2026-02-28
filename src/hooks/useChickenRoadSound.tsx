import { useCallback, useRef } from "react";

export const useChickenRoadSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTileClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }, [getCtx]);

  const playStep = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Happy chirp sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(800, t);
      osc1.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1000, t + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.1);
      osc2.start(t + 0.05);
      osc2.stop(t + 0.15);
    } catch {}
  }, [getCtx]);

  const playTrap = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Explosion: noise burst + low rumble
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      noise.connect(filter).connect(noiseGain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.4);

      // Low boom
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
      oscGain.gain.setValueAtTime(0.3, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }, [getCtx]);

  const playWin = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Victory fanfare: ascending notes
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(0.2, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.2);
      });
      // Shimmer
      const shimmer = ctx.createOscillator();
      const sGain = ctx.createGain();
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(1047, t + 0.4);
      shimmer.frequency.exponentialRampToValueAtTime(2094, t + 0.8);
      sGain.gain.setValueAtTime(0.1, t + 0.4);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      shimmer.connect(sGain).connect(ctx.destination);
      shimmer.start(t + 0.4);
      shimmer.stop(t + 0.8);
    } catch {}
  }, [getCtx]);

  const playCashOut = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      // Coin sound: bright ding ding
      [1200, 1500, 1800].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.18, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.15);
      });
    } catch {}
  }, [getCtx]);

  const playStart = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }, [getCtx]);

  return { playTileClick, playStep, playTrap, playWin, playCashOut, playStart };
};
