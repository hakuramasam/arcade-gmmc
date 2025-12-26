import { useCallback, useRef, useEffect, useState } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const bgMusicRef = useRef<{ oscillator: OscillatorNode; gain: GainNode } | null>(null);
  const bgMusicIntervalRef = useRef<number | null>(null);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.3
  ) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [isMuted]);

  const playHit = useCallback(() => {
    playTone(880, 0.1, 'square', 0.2);
    setTimeout(() => playTone(1100, 0.1, 'square', 0.15), 50);
  }, [playTone]);

  const playCombo = useCallback((comboLevel: number) => {
    const baseFreq = 440 + (comboLevel * 100);
    playTone(baseFreq, 0.15, 'sawtooth', 0.25);
    setTimeout(() => playTone(baseFreq * 1.5, 0.1, 'sawtooth', 0.2), 80);
    setTimeout(() => playTone(baseFreq * 2, 0.1, 'sawtooth', 0.15), 160);
  }, [playTone]);

  const playMiss = useCallback(() => {
    playTone(200, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.15), 100);
  }, [playTone]);

  const playGameStart = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'square', 0.25), i * 100);
    });
  }, [playTone]);

  const playGameEnd = useCallback(() => {
    const notes = [784, 659, 523, 392];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle', 0.25), i * 150);
    });
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(523, 0.1, 'square', 0.2);
    setTimeout(() => playTone(659, 0.1, 'square', 0.2), 100);
    setTimeout(() => playTone(784, 0.15, 'square', 0.25), 200);
    setTimeout(() => playTone(1047, 0.3, 'square', 0.3), 300);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(600, 0.05, 'square', 0.1);
  }, [playTone]);

  // Background music - retro arcade loop
  const startBgMusic = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Simple bass line pattern
      const bassNotes = [65, 82, 98, 82, 65, 82, 110, 98];
      let noteIndex = 0;

      const playBassNote = () => {
        if (isMuted) return;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(bassNotes[noteIndex], ctx.currentTime);

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);

        noteIndex = (noteIndex + 1) % bassNotes.length;
      };

      // Play immediately and set interval
      playBassNote();
      bgMusicIntervalRef.current = window.setInterval(playBassNote, 400);
    } catch (e) {
      console.warn('Background music failed:', e);
    }
  }, [isMuted]);

  const stopBgMusic = useCallback(() => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        stopBgMusic();
      }
      return !prev;
    });
  }, [stopBgMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBgMusic();
    };
  }, [stopBgMusic]);

  return {
    playHit,
    playCombo,
    playMiss,
    playGameStart,
    playGameEnd,
    playSuccess,
    playClick,
    startBgMusic,
    stopBgMusic,
    toggleMute,
    isMuted,
  };
}
