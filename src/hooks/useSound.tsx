import { useCallback, useRef } from "react";

type SoundType = "click" | "success" | "hover" | "game" | "deposit" | "error";

// Sound configurations using Web Audio API for crisp, responsive sounds
const soundConfigs: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; gain: number; decay?: number }> = {
  click: { frequency: 800, duration: 0.08, type: "sine", gain: 0.15, decay: 0.05 },
  hover: { frequency: 600, duration: 0.04, type: "sine", gain: 0.08 },
  success: { frequency: 880, duration: 0.15, type: "sine", gain: 0.2, decay: 0.1 },
  game: { frequency: 440, duration: 0.12, type: "triangle", gain: 0.2, decay: 0.08 },
  deposit: { frequency: 523, duration: 0.2, type: "sine", gain: 0.18, decay: 0.15 },
  error: { frequency: 200, duration: 0.15, type: "sawtooth", gain: 0.12 },
};

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMutedRef.current) return;

    try {
      const ctx = getAudioContext();
      const config = soundConfigs[type];

      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // Add pitch bend for some sounds
      if (type === "success") {
        oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + config.duration);
      } else if (type === "game") {
        oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + config.duration * 0.5);
      } else if (type === "deposit") {
        oscillator.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + config.duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + config.duration);
      }

      // Envelope
      gainNode.gain.setValueAtTime(config.gain, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch (e) {
      // Silently fail if audio is not supported
    }
  }, [getAudioContext]);

  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playHover = useCallback(() => playSound("hover"), [playSound]);
  const playSuccess = useCallback(() => playSound("success"), [playSound]);
  const playGame = useCallback(() => playSound("game"), [playSound]);
  const playDeposit = useCallback(() => playSound("deposit"), [playSound]);
  const playError = useCallback(() => playSound("error"), [playSound]);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  return {
    playSound,
    playClick,
    playHover,
    playSuccess,
    playGame,
    playDeposit,
    playError,
    toggleMute,
    isMuted: () => isMutedRef.current,
  };
};

export default useSound;
