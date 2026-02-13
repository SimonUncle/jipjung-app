"use client";

import {
  createOceanWavesSound,
  createSeagullSound,
  createSubmarineEngineSound,
  createWaterFlowSound,
  playCheckpointSound,
  playCompleteSound,
  playFailSound,
  playDiveHornSound,
  resumeAudioContext,
} from "./soundGenerator";

export type SoundType =
  | "checkpoint"
  | "complete"
  | "fail"
  | "oceanWaves"
  | "seagulls"
  | "submarineEngine"
  | "diveHorn"
  | "waterFlow";

interface SoundController {
  start: () => void;
  stop: () => void;
  setVolume?: (v: number) => void;
}

// 이벤트 효과음 비활성화 — 시각 효과만 유지
const EVENT_SOUND_MAP: Record<string, () => void> = {};

class SoundManager {
  private sounds: Map<string, SoundController> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;

    this.sounds.set("oceanWaves", createOceanWavesSound());
    this.sounds.set("seagulls", createSeagullSound());
    this.sounds.set("submarineEngine", createSubmarineEngineSound());
    this.sounds.set("waterFlow", createWaterFlowSound());

    this.initialized = true;
  }

  private ensureInit() {
    if (!this.initialized) {
      this.init();
    }
    resumeAudioContext();
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    this.ensureInit();

    // 원샷 사운드
    if (type === "checkpoint") { playCheckpointSound(); return; }
    if (type === "complete") { playCompleteSound(); return; }
    if (type === "fail") { playFailSound(); return; }
    if (type === "diveHorn") { playDiveHornSound(); return; }

    // 루프 사운드
    const sound = this.sounds.get(type);
    if (sound) {
      sound.start();
    }
  }

  stop(type: SoundType) {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.stop();
    }
  }

  fadeIn(type: SoundType, duration?: number) {
    this.play(type);
  }

  fadeOut(type: SoundType, duration?: number) {
    this.stop(type);
  }

  stopAll() {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  // 해저 사운드 (엔진 + 물 흐름)
  playUnderwaterSounds() {
    if (!this.enabled) return;
    this.ensureInit();

    const engine = this.sounds.get("submarineEngine");
    const waterFlow = this.sounds.get("waterFlow");

    waterFlow?.start();
    setTimeout(() => engine?.start(), 500);
  }

  stopUnderwaterSounds() {
    this.sounds.get("submarineEngine")?.stop();
    this.sounds.get("waterFlow")?.stop();
  }

  // 수면 사운드 (파도)
  playSurfaceSounds() {
    if (!this.enabled) return;
    this.ensureInit();

    const waves = this.sounds.get("oceanWaves");
    waves?.start();
  }

  stopSurfaceSounds() {
    this.sounds.get("oceanWaves")?.stop();
  }

  // 기존 호환: 잠항 사운드 (해저 소리만)
  playVoyageSounds() {
    this.playUnderwaterSounds();
  }

  stopVoyageSounds() {
    this.stopUnderwaterSounds();
    this.stopSurfaceSounds();
  }

  // 잠항 호른
  playDiveHorn() {
    if (!this.enabled) return;
    this.ensureInit();
    playDiveHornSound();
  }

  // 이벤트 효과음
  playEventSound(eventType: string) {
    if (!this.enabled) return;
    this.ensureInit();

    const playFn = EVENT_SOUND_MAP[eventType];
    if (playFn) {
      playFn();
    }
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();
