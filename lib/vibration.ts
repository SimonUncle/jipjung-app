"use client";

// 진동 API 지원 여부 확인
export function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

// 짧은 진동 (체크포인트)
export function vibrateCheckpoint() {
  if (isVibrationSupported()) {
    navigator.vibrate(100);
  }
}

// 성공 진동 패턴 (완료)
export function vibrateSuccess() {
  if (isVibrationSupported()) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

// 실패 진동 패턴
export function vibrateFail() {
  if (isVibrationSupported()) {
    navigator.vibrate([300, 100, 300]);
  }
}

// 일시정지 진동
export function vibratePause() {
  if (isVibrationSupported()) {
    navigator.vibrate(50);
  }
}
