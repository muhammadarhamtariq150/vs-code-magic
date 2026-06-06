import { useCallback, useRef } from "react";
import musicAsset from "@/assets/aviator-music.mp3.asset.json";

export const useAviatorSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const getCtx = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const getMusic = useCallback(() => {
    if (!musicRef.current) {
      const a = new Audio(musicAsset.url);
      a.loop = true;
      a.volume = 0.5;
      musicRef.current = a;
    }
    return musicRef.current;
  }, []);

  const playTakeoff = useCallback(() => {
    try {
      const a = getMusic();
      a.currentTime = 0;
      a.volume = 0.5;
      void a.play();
    } catch {}
  }, [getMusic]);

  const startFlyingSound = useCallback(() => {
    try {
      const a = getMusic();
      if (a.paused) void a.play();
    } catch {}
  }, [getMusic]);

  const updateFlyingPitch = useCallback((_multiplier: number) => {
    // no-op: using music track instead of synthesized pitch
  }, []);

  const stopFlyingSound = useCallback(() => {
    try {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
    } catch {}
  }, []);

  const playCrash = useCallback(() => {
    try {
      stopFlyingSound();
      const ctx = getCtx();
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
