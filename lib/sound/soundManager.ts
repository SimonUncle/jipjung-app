"use client";

import {
  createWindSound,
  createFootstepsSound,
  createBirdSound,
  createCampfireSound,
  createAmbientMusic,
  createOceanWavesSound,
  createSeagullSound,
  createShipEngineSound,
  createWaterFlowSound,
  playCheckpointSound,
  playCompleteSound,
  playFailSound,
  playShipHornSound,
  resumeAudioContext,
} from "./soundGenerator";

export type SoundType =
  | "wind"
  | "footsteps"
  | "birds"
  | "campfire"
  | "restMusic"
  | "checkpoint"
  | "complete"
  | "fail"
  | "oceanWaves"
  | "seagulls"
  | "shipEngine"
  | "shipHorn"
  | "waterFlow";

interface SoundController {
  start: () => void;
  stop: () => void;
  setVolume?: (v: number) => void;
}

class SoundManager {
  private sounds: Map<string, SoundController> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;

    // Web Audio API 기반 사운드 생성
    this.sounds.set("wind", createWindSound());
    this.sounds.set("footsteps", createFootstepsSound());
    this.sounds.set("birds", createBirdSound());
    this.sounds.set("campfire", createCampfireSound());
    this.sounds.set("restMusic", createAmbientMusic());

    // 항해 사운드
    this.sounds.set("oceanWaves", createOceanWavesSound());
    this.sounds.set("seagulls", createSeagullSound());
    this.sounds.set("shipEngine", createShipEngineSound());
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
    if (type === "checkpoint") {
      playCheckpointSound();
      return;
    }
    if (type === "complete") {
      playCompleteSound();
      return;
    }
    if (type === "fail") {
      playFailSound();
      return;
    }
    if (type === "shipHorn") {
      playShipHornSound();
      return;
    }

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
    // Web Audio API는 자동으로 부드럽게 시작
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

  // 탐험 사운드 (바람 + 발소리 + 새소리)
  playClimbingSounds() {
    if (!this.enabled) return;
    this.ensureInit();

    const wind = this.sounds.get("wind");
    const footsteps = this.sounds.get("footsteps");
    const birds = this.sounds.get("birds");

    wind?.start();
    setTimeout(() => footsteps?.start(), 500);
    setTimeout(() => birds?.start(), 1000);
  }

  stopClimbingSounds() {
    this.sounds.get("wind")?.stop();
    this.sounds.get("footsteps")?.stop();
    this.sounds.get("birds")?.stop();
  }

  // 휴식 사운드 (캠프파이어 + 음악)
  playRestSounds() {
    if (!this.enabled) return;
    this.ensureInit();

    const campfire = this.sounds.get("campfire");
    const music = this.sounds.get("restMusic");

    campfire?.start();
    setTimeout(() => music?.start(), 1000);
  }

  stopRestSounds() {
    this.sounds.get("campfire")?.stop();
    this.sounds.get("restMusic")?.stop();
  }

  // 항해 사운드 (파도 + 엔진 + 물결)
  playVoyageSounds() {
    if (!this.enabled) return;
    this.ensureInit();

    const waves = this.sounds.get("oceanWaves");
    const engine = this.sounds.get("shipEngine");
    const waterFlow = this.sounds.get("waterFlow");

    waves?.start();
    waterFlow?.start();
    setTimeout(() => engine?.start(), 500);
  }

  stopVoyageSounds() {
    this.sounds.get("oceanWaves")?.stop();
    this.sounds.get("shipEngine")?.stop();
    this.sounds.get("waterFlow")?.stop();
  }

  // 배 경적 (출항/입항)
  playShipHorn() {
    if (!this.enabled) return;
    this.ensureInit();
    playShipHornSound();
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();
