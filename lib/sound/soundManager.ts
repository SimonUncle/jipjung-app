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
  playSurfacingSound,
  playDivingSound,
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
  setVolume?: (v: number, rampTime?: number) => void;
}

// 기본 볼륨 상수
const DEFAULT_VOLUMES: Record<string, number> = {
  oceanWaves: 0.03,
  submarineEngine: 0.07,
  waterFlow: 0.04,
};

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

  fadeIn(type: SoundType, duration: number = 1.5) {
    if (!this.enabled) return;
    this.ensureInit();

    const sound = this.sounds.get(type);
    if (!sound) return;

    sound.start();
    const target = DEFAULT_VOLUMES[type] ?? 0.05;
    sound.setVolume?.(0, 0);
    sound.setVolume?.(target, duration);
  }

  fadeOut(type: SoundType, duration: number = 1.5) {
    const sound = this.sounds.get(type);
    if (!sound) return;

    sound.setVolume?.(0, duration);
    setTimeout(() => sound.stop(), duration * 1000 + 100);
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

  // 크로스페이드: 잠항 → 부상 (상승 전환음 포함)
  crossfadeToSurface(duration: number = 2) {
    if (!this.enabled) return;
    this.ensureInit();

    // 전환 효과음 재생
    playSurfacingSound();

    // 해저 사운드 페이드아웃
    this.fadeOut("submarineEngine", duration);
    this.fadeOut("waterFlow", duration);

    // 수면 사운드 페이드인
    this.fadeIn("oceanWaves", duration);
  }

  // 크로스페이드: 부상 → 잠항 (하강 전환음 포함)
  crossfadeToUnderwater(duration: number = 2) {
    if (!this.enabled) return;
    this.ensureInit();

    // 전환 효과음 재생
    playDivingSound();

    // 수면 사운드 페이드아웃
    this.fadeOut("oceanWaves", duration);

    // 해저 사운드 페이드인 (waterFlow 먼저, engine 300ms 후)
    this.fadeIn("waterFlow", duration);
    setTimeout(() => this.fadeIn("submarineEngine", duration), 300);
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();
