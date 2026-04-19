import { useState } from 'react';
import { GrammarPlayerState } from '@/app/types/grammar.types';

export function useGrammarPlayer() {
  const [playerState, setPlayerState] = useState<GrammarPlayerState>({
    isPlaying: false,
    currentStep: 1,
    speed: 1,
  });

  const play = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true }));
  };

  const pause = () => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  };

  const reset = () => {
    setPlayerState({
      isPlaying: false,
      currentStep: 1,
      speed: 1,
    });
  };

  const nextStep = () => {
    setPlayerState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4),
    }));
  };

  const prevStep = () => {
    setPlayerState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const setSpeed = (speed: number) => {
    setPlayerState((prev) => ({ ...prev, speed }));
  };

  return {
    playerState,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    setSpeed,
  };
}