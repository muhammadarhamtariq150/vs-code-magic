import { useCallback, useRef } from "react";

export const useAviatorSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const flyingOscRef = useRef<OscillatorNode | null>(null);
  const flyingGainRef = useRef<GainNode | null>(null);

  const getCtx = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTakeoff = useCallback(() => {
    try {
      const ctx = getCtx();
      // Engine roar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const osc2 = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(120, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 1);
      osc2.stop(ctx.currentTime + 1);
    } catch {}
  }, [getCtx]);

  const startFlyingSound = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      flyingOscRef.current = osc;
      flyingGainRef.current = gain;
    } catch {}
  }, [getCtx]);

  const updateFlyingPitch = useCallback((multiplier: number) => {
    try {
      if (flyingOscRef.current && flyingGainRef.current) {
        const ctx = getCtx();
        const freq = 100 + multiplier * 30;
        flyingOscRef.current.frequency.setValueAtTime(Math.min(freq, 600), ctx.currentTime);
        flyingGainRef.current.gain.setValueAtTime(Math.min(0.04 + multiplier * 0.005, 0.1), ctx.currentTime);
      }
    } catch {}
  }, [getCtx]);

  const stopFlyingSound = useCallback(() => {
    try {
      if (flyingOscRef.current) {
        flyingOscRef.current.stop();
        flyingOscRef.current = null;
        flyingGainRef.current = null;
      }
    } catch {}
  }, []);

  const playCrash = useCallback(() => {
    try {
      stopFlyingSound();
      const ctx = getCtx();
      // Explosion
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {}
  }, [getCtx, stopFlyingSound]);

  const playCashOut = useCallback(() => {
    try {
      stopFlyingSound();
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, [getCtx, stopFlyingSound]);

  const playBet = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [getCtx]);

  return { playTakeoff, startFlyingSound, updateFlyingPitch, stopFlyingSound, playCrash, playCashOut, playBet };
};
