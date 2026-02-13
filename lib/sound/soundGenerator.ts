"use client";

// Web Audio API로 자연스러운 사운드 생성

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// 백색소음 생성기
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// 브라운 노이즈 생성기 (더 부드러운 저주파)
function createBrownNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 10.0; // 볼륨 보정 (모바일 스피커에서 들리도록)
  }

  return buffer;
}

// 체크포인트 효과음
export function playCheckpointSound() {
  const ctx = getAudioContext();

  // 부드러운 상승 톤
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(350, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2000;

  osc.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// 완료 효과음
export function playCompleteSound() {
  const ctx = getAudioContext();

  // 부드러운 화음 아르페지오
  const notes = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5

  notes.forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 3000;

      osc.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }, i * 100);
  });
}

// 실패 효과음
export function playFailSound() {
  const ctx = getAudioContext();

  // 부드러운 하강 톤
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(280, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 500;

  osc.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

// AudioContext 재개
export async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

// ============================
// 잠항 사운드
// ============================

// 파도 소리 생성 (배경 앰비언트 + 개별 파도 이벤트)
export function createOceanWavesSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  // 모든 노드를 클로저에 저장 (GC 방지)
  let nodes: AudioNode[] = [];
  let isPlaying = false;
  let waveIntervalId: NodeJS.Timeout | null = null;

  // 개별 파도 크래시 이벤트 재생
  const playWaveCrash = () => {
    if (!isPlaying) return;

    const now = ctx.currentTime;

    // 파도 밀려오는 소리 (Brown noise + lowpass sweep)
    const approachBuffer = createBrownNoiseBuffer(ctx, 3);
    const approachSource = ctx.createBufferSource();
    approachSource.buffer = approachBuffer;

    const approachLowpass = ctx.createBiquadFilter();
    approachLowpass.type = "lowpass";
    approachLowpass.frequency.setValueAtTime(80, now);
    approachLowpass.frequency.linearRampToValueAtTime(350, now + 0.8);
    approachLowpass.frequency.linearRampToValueAtTime(500, now + 1.2);

    const approachGain = ctx.createGain();
    approachGain.gain.setValueAtTime(0, now);
    approachGain.gain.linearRampToValueAtTime(0.04, now + 0.5);
    approachGain.gain.linearRampToValueAtTime(0.06, now + 1.0);
    approachGain.gain.linearRampToValueAtTime(0.03, now + 2.0);
    approachGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    approachSource.connect(approachLowpass);
    approachLowpass.connect(approachGain);
    approachGain.connect(ctx.destination);
    approachSource.start(now);
    approachSource.stop(now + 3);

    // 파도 부딪히는 소리 (White noise burst) - 더 긴 버퍼와 부드러운 페이드
    const crashBuffer = createNoiseBuffer(ctx, 2.5);
    const crashSource = ctx.createBufferSource();
    crashSource.buffer = crashBuffer;

    const crashHighpass = ctx.createBiquadFilter();
    crashHighpass.type = "highpass";
    crashHighpass.frequency.value = 800;

    const crashLowpass = ctx.createBiquadFilter();
    crashLowpass.type = "lowpass";
    crashLowpass.frequency.setValueAtTime(4000, now + 0.8);
    crashLowpass.frequency.linearRampToValueAtTime(2000, now + 2.5);

    const crashGain = ctx.createGain();
    crashGain.gain.setValueAtTime(0, now + 0.8);
    crashGain.gain.linearRampToValueAtTime(0.03, now + 0.9);
    crashGain.gain.linearRampToValueAtTime(0.04, now + 1.1);
    crashGain.gain.linearRampToValueAtTime(0.02, now + 1.8);
    crashGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    crashSource.connect(crashHighpass);
    crashHighpass.connect(crashLowpass);
    crashLowpass.connect(crashGain);
    crashGain.connect(ctx.destination);
    crashSource.start(now + 0.8);
    crashSource.stop(now + 3);

    // 파도 빠지는 소리 (receding) - 부드러운 페이드인/아웃
    const recedeBuffer = createBrownNoiseBuffer(ctx, 4);
    const recedeSource = ctx.createBufferSource();
    recedeSource.buffer = recedeBuffer;

    const recedeLowpass = ctx.createBiquadFilter();
    recedeLowpass.type = "lowpass";
    recedeLowpass.frequency.setValueAtTime(500, now + 1.2);
    recedeLowpass.frequency.linearRampToValueAtTime(300, now + 2.5);
    recedeLowpass.frequency.linearRampToValueAtTime(100, now + 4);

    const recedeGain = ctx.createGain();
    // 부드러운 페이드인
    recedeGain.gain.setValueAtTime(0, now + 1.2);
    recedeGain.gain.linearRampToValueAtTime(0.03, now + 1.5);
    recedeGain.gain.linearRampToValueAtTime(0.04, now + 2.0);
    // 천천히 페이드아웃
    recedeGain.gain.linearRampToValueAtTime(0.02, now + 3.0);
    recedeGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

    recedeSource.connect(recedeLowpass);
    recedeLowpass.connect(recedeGain);
    recedeGain.connect(ctx.destination);
    recedeSource.start(now + 1.2);
    recedeSource.stop(now + 4.5);
  };

  // 다음 파도 예약
  const scheduleNextWave = () => {
    if (!isPlaying) return;
    // 5~12초 랜덤 간격
    const delay = 5000 + Math.random() * 7000;
    waveIntervalId = setTimeout(() => {
      playWaveCrash();
      scheduleNextWave();
    }, delay);
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 메인 게인
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.05;

    // 레이어 1: 배경 바다 소리 (브라운 노이즈)
    const waveBuffer = createBrownNoiseBuffer(ctx, 4);
    const waveSource = ctx.createBufferSource();
    waveSource.buffer = waveBuffer;
    waveSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 800;

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.5;

    // LFO로 미세한 변화
    const waveLfo = ctx.createOscillator();
    const waveLfoGain = ctx.createGain();
    waveLfo.frequency.value = 0.15;
    waveLfoGain.gain.value = 0.2;
    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(waveGain.gain);
    waveLfo.start();

    waveSource.connect(lowpass);
    lowpass.connect(waveGain);
    waveGain.connect(mainGain);

    // 레이어 2: 배경 쉬~소리 (폰 스피커에서 잘 들리는 대역)
    const ambientBuffer = createNoiseBuffer(ctx, 2);
    const ambientSource = ctx.createBufferSource();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;

    const ambientHighpass = ctx.createBiquadFilter();
    ambientHighpass.type = "highpass";
    ambientHighpass.frequency.value = 2000;

    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.15;

    ambientSource.connect(ambientHighpass);
    ambientHighpass.connect(ambientGain);
    ambientGain.connect(mainGain);

    mainGain.connect(ctx.destination);

    waveSource.start();
    ambientSource.start();

    // 모든 노드 참조 유지 (GC 방지 핵심)
    nodes = [mainGain, waveSource, lowpass, waveGain, waveLfo, waveLfoGain, ambientSource, ambientHighpass, ambientGain];

    // 첫 파도는 2~4초 후에
    setTimeout(() => {
      if (isPlaying) {
        playWaveCrash();
        scheduleNextWave();
      }
    }, 2000 + Math.random() * 2000);
  };

  const stop = () => {
    if (!isPlaying) return;
    isPlaying = false;

    nodes.forEach((n) => {
      try { if ('stop' in n && typeof (n as any).stop === 'function') (n as any).stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
    nodes = [];

    if (waveIntervalId) {
      clearTimeout(waveIntervalId);
      waveIntervalId = null;
    }
  };

  return { start, stop };
}

// 갈매기 소리 생성
export function createSeagullSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let intervalId: NodeJS.Timeout | null = null;
  let isPlaying = false;

  const playCall = () => {
    // 갈매기 울음소리 (높은 주파수)
    const osc = ctx.createOscillator();
    osc.type = "sine";

    const startFreq = 800 + Math.random() * 200;
    const peakFreq = 1200 + Math.random() * 300;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(peakFreq, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(startFreq * 0.9, ctx.currentTime + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // 가끔 두 번째 울음
    if (Math.random() > 0.6) {
      setTimeout(() => {
        if (!isPlaying) return;
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(startFreq * 1.1, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(peakFreq * 0.9, ctx.currentTime + 0.1);

        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.02, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 200 + Math.random() * 100);
    }
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 첫 울음
    setTimeout(playCall, 1000 + Math.random() * 2000);

    // 불규칙한 간격으로 울음 반복
    const scheduleNext = () => {
      if (!isPlaying) return;
      const delay = 5000 + Math.random() * 10000; // 5-15초 간격
      intervalId = setTimeout(() => {
        if (!isPlaying) return;
        playCall();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  };

  const stop = () => {
    isPlaying = false;
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  };

  return { start, stop };
}

// 잠수함 엔진 소리 생성
export function createSubmarineEngineSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  // 모든 노드를 클로저에 저장 (GC 방지)
  let nodes: AudioNode[] = [];
  let isPlaying = false;

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 메인 게인
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.07;

    // 레이어 1: 엔진 험 (순음 — 폰 스피커에서 확실히 들림)
    const hum = ctx.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 200;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.25;

    hum.connect(humGain);
    humGain.connect(mainGain);
    hum.start();

    // 레이어 2: 노이즈 텍스처 (브라운 노이즈 → bandpass)
    const engineBuffer = createBrownNoiseBuffer(ctx, 3);
    const engineSource = ctx.createBufferSource();
    engineSource.buffer = engineBuffer;
    engineSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 300;
    bandpass.Q.value = 1.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;

    engineSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(mainGain);
    engineSource.start();

    // 미세한 진동 (LFO → mainGain 변조)
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 4;
    vibratoGain.gain.value = 0.03;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(mainGain.gain);
    vibrato.start();

    mainGain.connect(ctx.destination);

    // 모든 노드 참조 유지 (GC 방지 핵심)
    nodes = [mainGain, hum, humGain, engineSource, bandpass, noiseGain, vibrato, vibratoGain];
  };

  const stop = () => {
    if (!isPlaying) return;
    isPlaying = false;

    nodes.forEach((n) => {
      try { if ('stop' in n && typeof (n as any).stop === 'function') (n as any).stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
    nodes = [];
  };

  return { start, stop };
}

// 잠항 호른 효과음 (원샷) - 부드러운 "부~" 경적
export function playDiveHornSound() {
  const ctx = getAudioContext();

  // 두 개의 톤이 겹친 경적 소리 (더 깊은 톤)
  const frequencies = [150, 200]; // 저음 화음

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sine"; // 부드러운 파형
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 600;

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.6);
  });
}

// 물결 스침 소리 (잠수함이 물을 가르며 지나가는 소리)
export function createWaterFlowSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  // 모든 노드를 클로저에 저장 (GC 방지)
  let nodes: AudioNode[] = [];
  let isPlaying = false;

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 메인 게인
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.04;

    // 레이어 1: 물 흐르는 소리 (브라운노이즈 베이스 — 보조)
    const flowBuffer = createBrownNoiseBuffer(ctx, 3);
    const flowSource = ctx.createBufferSource();
    flowSource.buffer = flowBuffer;
    flowSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 500;
    bandpass.Q.value = 0.6;

    const flowGain = ctx.createGain();
    flowGain.gain.value = 0.15;

    flowSource.connect(bandpass);
    bandpass.connect(flowGain);
    flowGain.connect(mainGain);

    // 레이어 2: 쉬~소리 (화이트노이즈 — 메인, 폰 스피커에서 잘 들림)
    const shushBuffer = createNoiseBuffer(ctx, 2);
    const shushSource = ctx.createBufferSource();
    shushSource.buffer = shushBuffer;
    shushSource.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 800;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2000;

    const shushGain = ctx.createGain();
    shushGain.gain.value = 0.25;

    shushSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(shushGain);
    shushGain.connect(mainGain);

    // LFO로 물결 변화 (두 레이어 모두 변조)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(mainGain.gain);
    lfo.start();

    mainGain.connect(ctx.destination);

    flowSource.start();
    shushSource.start();

    // 모든 노드 참조 유지 (GC 방지 핵심)
    nodes = [mainGain, flowSource, bandpass, flowGain, shushSource, highpass, lowpass, shushGain, lfo, lfoGain];
  };

  const stop = () => {
    if (!isPlaying) return;
    isPlaying = false;

    nodes.forEach((n) => {
      try { if ('stop' in n && typeof (n as any).stop === 'function') (n as any).stop(); } catch {}
      try { n.disconnect(); } catch {}
    });
    nodes = [];
  };

  return { start, stop };
}

// ============================
// 이벤트 효과음 (6종)
// ============================

// 소나 핑 (마일스톤: departure, halfway, approaching)
export function playSonarPingSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1000, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(1500, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1500;
  bandpass.Q.value = 5;

  osc.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

// 저주파 럼블 (폭풍: storm)
export function playStormRumbleSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const buffer = createBrownNoiseBuffer(ctx, 1.2);
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(60, now);
  lowpass.frequency.linearRampToValueAtTime(120, now + 0.4);
  lowpass.frequency.linearRampToValueAtTime(40, now + 1.0);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 1.2);
}

// 고래/돌고래 울음 (생물: whale_breach, dolphin_pod)
export function playWhaleCallSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(600, now + 0.3);
  osc.frequency.linearRampToValueAtTime(400, now + 0.5);
  osc.frequency.linearRampToValueAtTime(800, now + 0.8);
  osc.frequency.linearRampToValueAtTime(300, now + 1.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
  gain.gain.setValueAtTime(0.06, now + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1200;

  osc.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.5);
}

// 깊은 진동 (심해: deep_trench, volcano_glow)
export function playDeepVibeSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 50;

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  const buffer = createBrownNoiseBuffer(ctx, 0.8);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseLowpass = ctx.createBiquadFilter();
  noiseLowpass.type = "lowpass";
  noiseLowpass.frequency.value = 100;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.15);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  noise.connect(noiseLowpass);
  noiseLowpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.8);
  noise.start(now);
  noise.stop(now + 0.8);
}

// 소나 비프 (선박: cargo_ship, sonar_contact)
export function playSonarBeepSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  [0, 0.2].forEach((offset) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.1, now + offset + 0.02);
    gain.gain.setValueAtTime(0.1, now + offset + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.15);
  });
}

// 발견 차임 (기타: ruins, squid, jellyfish, cable, sunset, land)
export function playDiscoveryChimeSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25]; // C5 → E5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.15 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3000;

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.4);
  });
}
