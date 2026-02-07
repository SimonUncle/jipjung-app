"use client";

import { useEffect, useCallback, useRef } from "react";
import { soundManager, SoundType } from "@/lib/sound/soundManager";
import { resumeAudioContext } from "@/lib/sound/soundGenerator";
import { useLocalStorage } from "./useLocalStorage";

export function useSound() {
  const { data } = useLocalStorage();
  const hasInteracted = useRef(false);

  // 사운드 설정 동기화
  useEffect(() => {
    soundManager.setEnabled(data.settings.soundEnabled);
  }, [data.settings.soundEnabled]);

  // 사용자 인터랙션 감지 (AudioContext 활성화)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleInteraction = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        resumeAudioContext();
        soundManager.init();
      }
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const play = useCallback((type: SoundType) => {
    soundManager.play(type);
  }, []);

  const stop = useCallback((type: SoundType) => {
    soundManager.stop(type);
  }, []);

  const fadeIn = useCallback((type: SoundType, duration?: number) => {
    soundManager.fadeIn(type, duration);
  }, []);

  const fadeOut = useCallback((type: SoundType, duration?: number) => {
    soundManager.fadeOut(type, duration);
  }, []);

  const playClimbingSounds = useCallback(() => {
    soundManager.playClimbingSounds();
  }, []);

  const stopClimbingSounds = useCallback(() => {
    soundManager.stopClimbingSounds();
  }, []);

  const playRestSounds = useCallback(() => {
    soundManager.playRestSounds();
  }, []);

  const stopRestSounds = useCallback(() => {
    soundManager.stopRestSounds();
  }, []);

  const playVoyageSounds = useCallback(() => {
    soundManager.playVoyageSounds();
  }, []);

  const stopVoyageSounds = useCallback(() => {
    soundManager.stopVoyageSounds();
  }, []);

  const playShipHorn = useCallback(() => {
    soundManager.playShipHorn();
  }, []);

  const stopAll = useCallback(() => {
    soundManager.stopAll();
  }, []);

  return {
    play,
    stop,
    fadeIn,
    fadeOut,
    playClimbingSounds,
    stopClimbingSounds,
    playRestSounds,
    stopRestSounds,
    playVoyageSounds,
    stopVoyageSounds,
    playShipHorn,
    stopAll,
    isEnabled: data.settings.soundEnabled,
  };
}
