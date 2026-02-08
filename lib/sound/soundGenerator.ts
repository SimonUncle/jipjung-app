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
    data[i] *= 3.5; // 볼륨 보정
  }

  return buffer;
}

// 자연스러운 바람 소리 생성 (다중 레이어)
export function createWindSound(): {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
} {
  const ctx = getAudioContext();
  let sources: AudioBufferSourceNode[] = [];
  let gainNode: GainNode | null = null;
  let isPlaying = false;

  const start = () => {
    if (isPlaying) return;

    // 메인 게인
    gainNode = ctx.createGain();
    gainNode.gain.value = 0.04; // 백색소음 느낌으로 작게

    // 레이어 1: 저주파 바람 (브라운 노이즈)
    const brownBuffer = createBrownNoiseBuffer(ctx, 3);
    const brownSource = ctx.createBufferSource();
    brownSource.buffer = brownBuffer;
    brownSource.loop = true;

    const lowpass1 = ctx.createBiquadFilter();
    lowpass1.type = "lowpass";
    lowpass1.frequency.value = 150;
    lowpass1.Q.value = 0.5;

    const gain1 = ctx.createGain();
    gain1.gain.value = 0.6;

    // LFO로 세기 변화 (느리게)
    const lfo1 = ctx.createOscillator();
    const lfoGain1 = ctx.createGain();
    lfo1.frequency.value = 0.08; // 매우 느린 변화
    lfoGain1.gain.value = 0.3;
    lfo1.connect(lfoGain1);
    lfoGain1.connect(gain1.gain);
    lfo1.start();

    brownSource.connect(lowpass1);
    lowpass1.connect(gain1);
    gain1.connect(gainNode);

    // 레이어 2: 중주파 바람 흐름
    const noiseBuffer2 = createNoiseBuffer(ctx, 2);
    const noiseSource2 = ctx.createBufferSource();
    noiseSource2.buffer = noiseBuffer2;
    noiseSource2.loop = true;

    const bandpass2 = ctx.createBiquadFilter();
    bandpass2.type = "bandpass";
    bandpass2.frequency.value = 300;
    bandpass2.Q.value = 0.8;

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.25;

    // 다른 속도의 LFO
    const lfo2 = ctx.createOscillator();
    const lfoGain2 = ctx.createGain();
    lfo2.frequency.value = 0.15;
    lfoGain2.gain.value = 0.15;
    lfo2.connect(lfoGain2);
    lfoGain2.connect(gain2.gain);
    lfo2.start();

    noiseSource2.connect(bandpass2);
    bandpass2.connect(gain2);
    gain2.connect(gainNode);

    // 레이어 3: 미세한 고주파 (나뭇잎 스치는 소리)
    const noiseBuffer3 = createNoiseBuffer(ctx, 1.5);
    const noiseSource3 = ctx.createBufferSource();
    noiseSource3.buffer = noiseBuffer3;
    noiseSource3.loop = true;

    const highpass3 = ctx.createBiquadFilter();
    highpass3.type = "highpass";
    highpass3.frequency.value = 2000;
    highpass3.Q.value = 0.3;

    const gain3 = ctx.createGain();
    gain3.gain.value = 0.08;

    noiseSource3.connect(highpass3);
    highpass3.connect(gain3);
    gain3.connect(gainNode);

    gainNode.connect(ctx.destination);

    brownSource.start();
    noiseSource2.start();
    noiseSource3.start();

    sources = [brownSource, noiseSource2, noiseSource3];
    isPlaying = true;
  };

  const stop = () => {
    if (isPlaying) {
      sources.forEach((s) => {
        s.stop();
        s.disconnect();
      });
      sources = [];
      isPlaying = false;
    }
  };

  const setVolume = (v: number) => {
    if (gainNode) {
      gainNode.gain.value = v;
    }
  };

  return { start, stop, setVolume };
}

// 자연스러운 새소리 생성
export function createBirdSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let intervalId: NodeJS.Timeout | null = null;
  let isPlaying = false;

  const playChirp = (pattern: number) => {
    // 여러 패턴의 새소리
    const patterns = [
      // 패턴 0: 짧은 단음 (참새)
      () => {
        const baseFreq = 2200 + Math.random() * 600;
        playNote(baseFreq, 0.08, 0.012);
      },
      // 패턴 1: 두 음 (찌르레기)
      () => {
        const baseFreq = 1800 + Math.random() * 400;
        playNote(baseFreq, 0.1, 0.01);
        setTimeout(() => playNote(baseFreq * 1.2, 0.08, 0.008), 120);
      },
      // 패턴 2: 세 음 트릴 (굴뚝새)
      () => {
        const baseFreq = 2400 + Math.random() * 500;
        playNote(baseFreq, 0.06, 0.008);
        setTimeout(() => playNote(baseFreq * 1.15, 0.06, 0.008), 80);
        setTimeout(() => playNote(baseFreq * 0.95, 0.08, 0.01), 160);
      },
      // 패턴 3: 길게 지저귀기 (휘파람새)
      () => {
        const baseFreq = 1600 + Math.random() * 300;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.25);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      },
    ];

    const playNote = (freq: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      // Sine + 약간의 배음
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, ctx.currentTime + duration * 0.3);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    };

    patterns[pattern % patterns.length]();
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    let patternIndex = 0;
    const scheduleChirp = () => {
      if (!isPlaying) return;
      playChirp(patternIndex);
      patternIndex = (patternIndex + 1) % 4;

      // 더 자연스러운 간격 (4-10초)
      const nextDelay = 4000 + Math.random() * 6000;
      intervalId = setTimeout(scheduleChirp, nextDelay);
    };

    // 첫 새소리는 2-4초 후에
    intervalId = setTimeout(scheduleChirp, 2000 + Math.random() * 2000);
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

// 자연스러운 발소리 생성 (흙/자갈 밟는 느낌)
export function createFootstepsSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let intervalId: NodeJS.Timeout | null = null;
  let isPlaying = false;

  const playStep = () => {
    // 임팩트 + 크런치 레이어링
    const noise = ctx.createBufferSource();
    const noiseBuffer = createNoiseBuffer(ctx, 0.2);
    noise.buffer = noiseBuffer;

    // 밴드패스 필터 (흙/자갈 느낌)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 600 + Math.random() * 400; // 600-1000Hz
    bandpass.Q.value = 1.5;

    // 로우패스로 부드럽게
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2500;

    // 엔벨로프 (착지 임팩트)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.2);

    // 약간의 크런치 (자갈)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const crunch = ctx.createBufferSource();
        const crunchBuffer = createNoiseBuffer(ctx, 0.08);
        crunch.buffer = crunchBuffer;

        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 1500;

        const crunchGain = ctx.createGain();
        crunchGain.gain.setValueAtTime(0.008, ctx.currentTime);
        crunchGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        crunch.connect(highpass);
        highpass.connect(crunchGain);
        crunchGain.connect(ctx.destination);
        crunch.start();
        crunch.stop(ctx.currentTime + 0.08);
      }, 30 + Math.random() * 20);
    }
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 자연스러운 걸음 간격 (700-1100ms)
    const scheduleStep = () => {
      if (!isPlaying) return;
      playStep();
      const nextDelay = 700 + Math.random() * 400;
      intervalId = setTimeout(scheduleStep, nextDelay);
    };
    scheduleStep();
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

// 자연스러운 캠프파이어 소리
export function createCampfireSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let sources: AudioBufferSourceNode[] = [];
  let isPlaying = false;
  let crackleInterval: NodeJS.Timeout | null = null;

  const playCrackle = () => {
    // 다양한 크래클 음
    const noise = ctx.createBufferSource();
    const noiseBuffer = createNoiseBuffer(ctx, 0.08 + Math.random() * 0.06);
    noise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 500 + Math.random() * 1000; // 더 다양한 음정
    bandpass.Q.value = 2 + Math.random() * 2;

    const gain = ctx.createGain();
    const volume = 0.025 + Math.random() * 0.02;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.12);
  };

  const playPop = () => {
    // 장작 터지는 소리 (낮은 임팩트)
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 베이스 노이즈 (불꽃 소리)
    const noiseBuffer = createBrownNoiseBuffer(ctx, 2);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 180;

    const gain = ctx.createGain();
    gain.gain.value = 0.035;

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    sources.push(source);

    // 불규칙한 크래클
    const scheduleCrackle = () => {
      if (!isPlaying) return;

      playCrackle();

      // 가끔 팝 소리
      if (Math.random() > 0.85) {
        setTimeout(playPop, 50 + Math.random() * 100);
      }

      // 불규칙한 간격 (지수 분포에 가깝게)
      const baseDelay = 150;
      const randomFactor = Math.random() * Math.random() * 600;
      const nextDelay = baseDelay + randomFactor;

      crackleInterval = setTimeout(scheduleCrackle, nextDelay);
    };
    scheduleCrackle();
  };

  const stop = () => {
    isPlaying = false;
    sources.forEach((s) => {
      s.stop();
      s.disconnect();
    });
    sources = [];
    if (crackleInterval) {
      clearTimeout(crackleInterval);
      crackleInterval = null;
    }
  };

  return { start, stop };
}

// 휴식 음악 (부드러운 앰비언트)
export function createAmbientMusic(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let oscillators: OscillatorNode[] = [];
  let gains: GainNode[] = [];
  let isPlaying = false;

  // 화음 주파수 (Am7 - 더 평화로운 느낌)
  const frequencies = [110, 130.81, 164.81, 196]; // A2, C3, E3, G3

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 4); // 천천히 페이드 인

      // 느린 LFO로 볼륨 변화
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.05 + i * 0.02;
      lfoGain.gain.value = 0.004;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillators.push(osc);
      gains.push(gain);
    });
  };

  const stop = () => {
    isPlaying = false;
    oscillators.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    gains.forEach((gain) => gain.disconnect());
    oscillators = [];
    gains = [];
  };

  return { start, stop };
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
export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

// ============================
// 항해 사운드
// ============================

// 파도 소리 생성 (배경 앰비언트 + 개별 파도 이벤트)
export function createOceanWavesSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let sources: AudioBufferSourceNode[] = [];
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

    // 메인 게인 (배경 앰비언트는 더 작게)
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.04; // 기존 0.08에서 절반으로 감소

    // 레이어 1: 저주파 배경 바다 소리 (브라운 노이즈)
    const waveBuffer = createBrownNoiseBuffer(ctx, 4);
    const waveSource = ctx.createBufferSource();
    waveSource.buffer = waveBuffer;
    waveSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 200;

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

    // 레이어 2: 미세한 배경 쉬~소리
    const ambientBuffer = createNoiseBuffer(ctx, 2);
    const ambientSource = ctx.createBufferSource();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;

    const ambientHighpass = ctx.createBiquadFilter();
    ambientHighpass.type = "highpass";
    ambientHighpass.frequency.value = 2000;

    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.08;

    ambientSource.connect(ambientHighpass);
    ambientHighpass.connect(ambientGain);
    ambientGain.connect(mainGain);

    mainGain.connect(ctx.destination);

    waveSource.start();
    ambientSource.start();

    sources = [waveSource, ambientSource];

    // 첫 파도는 2~4초 후에
    setTimeout(() => {
      if (isPlaying) {
        playWaveCrash();
        scheduleNextWave();
      }
    }, 2000 + Math.random() * 2000);
  };

  const stop = () => {
    if (isPlaying) {
      sources.forEach((s) => {
        s.stop();
        s.disconnect();
      });
      sources = [];
      isPlaying = false;

      if (waveIntervalId) {
        clearTimeout(waveIntervalId);
        waveIntervalId = null;
      }
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

// 배 엔진 소리 생성
export function createShipEngineSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let sources: AudioBufferSourceNode[] = [];
  let isPlaying = false;

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 저주파 엔진 럼블
    const engineBuffer = createBrownNoiseBuffer(ctx, 3);
    const engineSource = ctx.createBufferSource();
    engineSource.buffer = engineBuffer;
    engineSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 80;

    const gain = ctx.createGain();
    gain.gain.value = 0.03;

    // 미세한 진동
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 12; // 엔진 진동
    vibratoGain.gain.value = 0.008;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(gain.gain);
    vibrato.start();

    engineSource.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);
    engineSource.start();

    sources = [engineSource];
  };

  const stop = () => {
    if (isPlaying) {
      sources.forEach((s) => {
        s.stop();
        s.disconnect();
      });
      sources = [];
      isPlaying = false;
    }
  };

  return { start, stop };
}

// 배 경적 효과음 (원샷) - 부드러운 "부~" 경적
export function playShipHornSound() {
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

// 물결 스침 소리 (배가 물을 가르며 지나가는 소리)
export function createWaterFlowSound(): {
  start: () => void;
  stop: () => void;
} {
  const ctx = getAudioContext();
  let sources: AudioBufferSourceNode[] = [];
  let isPlaying = false;

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // 메인 게인
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.04;

    // 레이어 1: 물 흐르는 소리 (브라운노이즈 베이스)
    const flowBuffer = createBrownNoiseBuffer(ctx, 3);
    const flowSource = ctx.createBufferSource();
    flowSource.buffer = flowBuffer;
    flowSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 400;
    bandpass.Q.value = 0.6;

    const flowGain = ctx.createGain();
    flowGain.gain.value = 0.5;

    // 아주 미세한 LFO (물결 변화)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(flowGain.gain);
    lfo.start();

    flowSource.connect(bandpass);
    bandpass.connect(flowGain);
    flowGain.connect(mainGain);

    // 레이어 2: 부드러운 쉬~소리 (화이트노이즈)
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
    shushGain.gain.value = 0.15;

    shushSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(shushGain);
    shushGain.connect(mainGain);

    mainGain.connect(ctx.destination);

    flowSource.start();
    shushSource.start();

    sources = [flowSource, shushSource];
  };

  const stop = () => {
    if (isPlaying) {
      sources.forEach((s) => {
        s.stop();
        s.disconnect();
      });
      sources = [];
      isPlaying = false;
    }
  };

  return { start, stop };
}
