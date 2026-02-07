"use client";

import { useEffect, useState, useMemo } from "react";
import { calculateBaselineOffset, RectElement } from "@/lib/spriteUtils";

interface PixelCharacterProps {
  isWalking: boolean;
  state?: "normal" | "resting" | "struggling";
  mode?: "horizontal" | "vertical";
}

// 상수 정의: groundLineY 기준점
const PX = 4;
const GROUND_LINE_OFFSET = 8; // 그림자 공간 (bottom에서 groundLine까지)
const SPRITE_HEIGHT = 24 * PX; // 96px (캐릭터 전체 높이)
const CONTAINER_HEIGHT = SPRITE_HEIGHT + GROUND_LINE_OFFSET; // 104px

// 상체/하체 분리 기준 (SVG viewBox 기준)
const UPPER_BODY_END_Y = 13; // 상체: y 0~13
const LOWER_BODY_HEIGHT = 24 - UPPER_BODY_END_Y; // 하체: y 13~24 (11px)

// 부츠 상수
const BOOT_HEIGHT = 3;

// 부츠 위치 데이터 (baseline 계산용)
const WALK_BOOT_POSITIONS = [
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
];

const CLIMB_BOOT_POSITIONS = [
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
  { leftBootY: 8, rightBootY: 8 },
];

/**
 * 하체 baseline offset 계산
 * SVG viewBox 바닥에서 실제 발바닥 픽셀까지의 거리를 반환
 */
function getLowerBodyBaselineOffset(
  frame: number,
  mode: "horizontal" | "vertical"
): number {
  const bootPositions = mode === "vertical" ? CLIMB_BOOT_POSITIONS : WALK_BOOT_POSITIONS;
  const leg = bootPositions[frame];

  // 부츠 rect 요소들
  const bootElements: RectElement[] = [
    { y: leg.leftBootY, height: BOOT_HEIGHT },
    { y: leg.rightBootY, height: BOOT_HEIGHT },
  ];

  return calculateBaselineOffset(LOWER_BODY_HEIGHT, bootElements);
}

export function PixelCharacter({
  isWalking,
  state = "normal",
  mode = "horizontal",
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);
  const [idleFrame, setIdleFrame] = useState(0);

  // Walking animation - 4 frames
  useEffect(() => {
    if (!isWalking) {
      setFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, mode === "vertical" ? 150 : 120);

    return () => clearInterval(interval);
  }, [isWalking, mode]);

  // Idle breathing animation
  useEffect(() => {
    if (isWalking) return;

    const interval = setInterval(() => {
      setIdleFrame((f) => (f + 1) % 4);
    }, 400);

    return () => clearInterval(interval);
  }, [isWalking]);

  // 상체 Y-bob (상체에만 적용, 하체는 고정)
  const walkBounce = [-1, -2, -1, -2];
  const climbBounce = [-2, -3, -2, -3];
  const bouncePattern = mode === "vertical" ? climbBounce : walkBounce;

  // 상체 좌우 흔들림
  const swayPattern = [0, 1, 0, -1];

  // Idle 숨쉬기 (상체만)
  const idleBounce = [0, -0.5, -1, -0.5];

  const upperBodyOffsetY = isWalking ? bouncePattern[frame] : idleBounce[idleFrame];
  const upperBodyOffsetX = isWalking ? swayPattern[frame] : 0;

  // 스텝 펄스: 발이 밀 때만 앞으로 (X만, Y 아님)
  const stepForwardPattern = [3, 0, 3, 0];
  const stepForwardOffset = isWalking ? stepForwardPattern[frame] : 0;

  // baseline offset 계산: 스프라이트 분석 결과
  // viewBox 바닥에서 실제 발바닥까지의 거리 (픽셀 스케일 적용)
  const baselineOffset = getLowerBodyBaselineOffset(isWalking ? frame : 0, mode) * PX;

  // 하체 bottom 위치: groundLine에서 baselineOffset만큼 보정
  const lowerBodyBottom = GROUND_LINE_OFFSET - baselineOffset;

  // 먼지 파티클
  const dustParticles = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      offsetX: (i - 1) * 8,
      delay: i * 0.05,
    }));
  }, []);

  return (
    <div
      className="relative"
      style={{
        width: 16 * PX,
        height: CONTAINER_HEIGHT,
        imageRendering: "pixelated",
      }}
    >
      {/* 접지 그림자 - groundLine 바로 위에 */}
      <div
        className="absolute left-1/2"
        style={{
          bottom: GROUND_LINE_OFFSET,
          width: 24,
          height: 6,
          background: "rgba(0, 0, 0, 0.5)",
          transform: "translateX(-50%)",
        }}
      />

      {/* 걸을 때 먼지 파티클 */}
      {isWalking && frame % 2 === 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ bottom: GROUND_LINE_OFFSET }}
        >
          {dustParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: 2,
                height: 2,
                left: p.offsetX,
                background: mode === "vertical" ? "#5a5550" : "#8b7355",
                opacity: 0.5,
                animation: `dustPuff 0.3s ease-out forwards`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 하체 - Y 고정! 발이 항상 groundLine에 닿음 (baseline 보정 적용) */}
      <div
        className="absolute left-0"
        style={{
          bottom: lowerBodyBottom,
          transform: `translateX(${stepForwardOffset}px)`, // X 이동만
          transition: "transform 80ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {mode === "vertical" ? (
          <ClimbLowerBody frame={isWalking ? frame : 0} px={PX} />
        ) : (
          <WalkLowerBody frame={isWalking ? frame : 0} px={PX} />
        )}
      </div>

      {/* 상체 - Y-bob 적용 (상체만 위아래로 움직임, baseline 보정 적용) */}
      <div
        className="absolute left-0"
        style={{
          bottom: lowerBodyBottom + LOWER_BODY_HEIGHT * PX, // 하체 위에 위치
          transform: `translate(${upperBodyOffsetX + stepForwardOffset}px, ${upperBodyOffsetY}px)`,
          transition: "transform 80ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          animation: state === "struggling" ? "shake 0.15s infinite" : undefined,
        }}
      >
        {mode === "vertical" ? (
          <ClimbUpperBody frame={isWalking ? frame : 0} px={PX} state={state} isIdle={!isWalking} idleFrame={idleFrame} />
        ) : (
          <WalkUpperBody frame={isWalking ? frame : 0} px={PX} state={state} isIdle={!isWalking} idleFrame={idleFrame} />
        )}
      </div>

      {/* 디버그: 발바닥 위치 점 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50"
        style={{
          bottom: lowerBodyBottom,
          width: 6,
          height: 6,
          background: "lime",
          borderRadius: "50%",
        }}
      />

      {state === "resting" && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm animate-bounce">
          💧
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-2px); }
        }
        @keyframes dustPuff {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-6px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Walking - Upper Body (머리, 몸, 팔: y 0~13)
function WalkUpperBody({
  frame,
  px,
  state,
  isIdle,
  idleFrame,
}: {
  frame: number;
  px: number;
  state: string;
  isIdle: boolean;
  idleFrame: number;
}) {
  const skinColor = "#e4a672";
  const skinShadow = "#c4865a";
  const shirtColor = state === "struggling" ? "#4a6fa5" : "#e74c3c";
  const shirtShadow = state === "struggling" ? "#3a5a85" : "#c73c2c";
  const hairColor = "#3d2314";

  const armPositions = [
    { leftArmX: 2, leftArmY: 9, rightArmX: 13, rightArmY: 7 },
    { leftArmX: 1, leftArmY: 8, rightArmX: 13, rightArmY: 8 },
    { leftArmX: 0, leftArmY: 7, rightArmX: 13, rightArmY: 9 },
    { leftArmX: 1, leftArmY: 8, rightArmX: 13, rightArmY: 8 },
  ];

  const arm = isIdle ? armPositions[0] : armPositions[frame];

  return (
    <svg
      width={16 * px}
      height={UPPER_BODY_END_Y * px}
      viewBox="0 0 16 13"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Hair */}
      <rect x="5" y="0" width="6" height="3" fill={hairColor} />
      <rect x="4" y="1" width="1" height="2" fill={hairColor} />
      <rect x="11" y="1" width="1" height="1" fill={hairColor} />

      {/* Head */}
      <rect x="5" y="2" width="6" height="5" fill={skinColor} />
      <rect x="4" y="3" width="1" height="3" fill={skinColor} />
      <rect x="11" y="3" width="1" height="3" fill={skinShadow} />

      {/* Eyes */}
      <rect x="6" y="4" width="1" height="1" fill="#1a1a2e" />
      <rect x="9" y="4" width="1" height="1" fill="#1a1a2e" />

      {/* Mouth */}
      <rect x="7" y="5" width="2" height="1" fill={skinShadow} />

      {/* Body/Shirt */}
      <rect x="4" y="7" width="8" height="6" fill={shirtColor} />
      <rect x="3" y="8" width="1" height="4" fill={shirtColor} />
      <rect x="12" y="8" width="1" height="4" fill={shirtShadow} />
      <rect x="6" y="7" width="4" height="1" fill={shirtShadow} />

      {/* Backpack */}
      <rect x="12" y="8" width="2" height="4" fill="#8b4513" />
      <rect x="13" y="9" width="1" height="2" fill="#6b3503" />

      {/* Left Arm */}
      <rect x={arm.leftArmX} y={arm.leftArmY} width="2" height="4" fill={skinColor} />
      <rect x={arm.leftArmX} y={arm.leftArmY + 3} width="2" height="1" fill={skinShadow} />

      {/* Right Arm */}
      <rect x={arm.rightArmX} y={arm.rightArmY} width="2" height="4" fill={skinShadow} />
    </svg>
  );
}

// Walking - Lower Body (바지, 다리, 부츠: y 13~24)
function WalkLowerBody({
  frame,
  px,
}: {
  frame: number;
  px: number;
}) {
  const pantsColor = "#2c3e50";
  const pantsShadow = "#1c2e40";
  const bootColor = "#1a1a2e";

  // 다리 위치 (원본 y에서 13을 빼서 0부터 시작)
  // 부츠가 viewBox 바닥(y=11)에 닿도록 bootY=8 (8+3=11)
  const legPositions = [
    { leftY: 1, leftH: 7, rightY: 2, rightH: 6, leftBootY: 8, rightBootY: 8 },
    { leftY: 1, leftH: 6, rightY: 1, rightH: 6, leftBootY: 8, rightBootY: 8 },
    { leftY: 2, leftH: 6, rightY: 1, rightH: 7, leftBootY: 8, rightBootY: 8 },
    { leftY: 1, leftH: 6, rightY: 1, rightH: 6, leftBootY: 8, rightBootY: 8 },
  ];

  const leg = legPositions[frame];

  return (
    <svg
      width={16 * px}
      height={LOWER_BODY_HEIGHT * px}
      viewBox="0 0 16 11"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pants base */}
      <rect x="5" y="0" width="6" height="3" fill={pantsColor} />

      {/* Left leg */}
      <rect x="5" y={leg.leftY} width="2" height={leg.leftH} fill={pantsColor} />
      <rect x="6" y={leg.leftY} width="1" height={leg.leftH} fill={pantsShadow} />
      <rect x="4" y={leg.leftBootY} width="3" height="3" fill={bootColor} />
      <rect x="4" y={leg.leftBootY + 2} width="3" height="1" fill="#2a2a3e" />

      {/* Right leg */}
      <rect x="9" y={leg.rightY} width="2" height={leg.rightH} fill={pantsColor} />
      <rect x="10" y={leg.rightY} width="1" height={leg.rightH} fill={pantsShadow} />
      <rect x="9" y={leg.rightBootY} width="3" height="3" fill={bootColor} />
      <rect x="9" y={leg.rightBootY + 2} width="3" height="1" fill="#2a2a3e" />
    </svg>
  );
}

// Climbing - Upper Body (머리, 몸, 팔: y 0~13)
function ClimbUpperBody({
  frame,
  px,
  state,
  isIdle,
  idleFrame,
}: {
  frame: number;
  px: number;
  state: string;
  isIdle: boolean;
  idleFrame: number;
}) {
  const skinColor = "#e4a672";
  const skinShadow = "#c4865a";
  const shirtColor = state === "struggling" ? "#4a6fa5" : "#e74c3c";
  const shirtShadow = state === "struggling" ? "#3a5a85" : "#c73c2c";
  const hairColor = "#3d2314";

  const armPositions = [
    { leftArmX: 1, leftArmY: 7, rightArmX: 13, rightArmY: 6 },
    { leftArmX: 1, leftArmY: 8, rightArmX: 13, rightArmY: 7 },
    { leftArmX: 1, leftArmY: 6, rightArmX: 13, rightArmY: 7 },
    { leftArmX: 1, leftArmY: 7, rightArmX: 13, rightArmY: 8 },
  ];

  const arm = isIdle ? armPositions[0] : armPositions[frame];
  const bodyLean = isIdle ? 0 : (frame % 2 === 0 ? 1 : 0);

  return (
    <svg
      width={16 * px}
      height={UPPER_BODY_END_Y * px}
      viewBox="0 0 16 13"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Hair */}
      <rect x={5 + bodyLean} y="0" width="6" height="3" fill={hairColor} />
      <rect x={4 + bodyLean} y="1" width="1" height="2" fill={hairColor} />

      {/* Head */}
      <rect x={5 + bodyLean} y="2" width="6" height="5" fill={skinColor} />
      <rect x={4 + bodyLean} y="3" width="1" height="3" fill={skinColor} />
      <rect x={11 + bodyLean} y="3" width="1" height="3" fill={skinShadow} />

      {/* Eyes looking up */}
      <rect x={6 + bodyLean} y="3" width="1" height="1" fill="#1a1a2e" />
      <rect x={9 + bodyLean} y="3" width="1" height="1" fill="#1a1a2e" />

      {/* Mouth */}
      <rect x={7 + bodyLean} y="5" width="2" height="1" fill={skinShadow} />

      {/* Body/Shirt */}
      <rect x={4 + bodyLean} y="7" width="8" height="6" fill={shirtColor} />
      <rect x={3 + bodyLean} y="8" width="1" height="4" fill={shirtColor} />
      <rect x={12 + bodyLean} y="8" width="1" height="4" fill={shirtShadow} />
      <rect x={6 + bodyLean} y="7" width="4" height="1" fill={shirtShadow} />

      {/* Backpack */}
      <rect x={12 + bodyLean} y="8" width="2" height="4" fill="#8b4513" />
      <rect x={13 + bodyLean} y="9" width="1" height="2" fill="#6b3503" />

      {/* Left Arm */}
      <rect x={arm.leftArmX + bodyLean} y={arm.leftArmY} width="2" height="4" fill={skinColor} />
      <rect x={arm.leftArmX + bodyLean} y={arm.leftArmY + 3} width="2" height="1" fill={skinShadow} />

      {/* Right Arm */}
      <rect x={arm.rightArmX + bodyLean} y={arm.rightArmY} width="2" height="4" fill={skinShadow} />
    </svg>
  );
}

// Climbing - Lower Body (바지, 다리, 부츠: y 13~24)
function ClimbLowerBody({
  frame,
  px,
}: {
  frame: number;
  px: number;
}) {
  const pantsColor = "#2c3e50";
  const pantsShadow = "#1c2e40";
  const bootColor = "#1a1a2e";

  // 다리 위치 (원본 y에서 13을 빼서 0부터 시작, 부츠도 조정)
  // 부츠가 viewBox 바닥(y=11)에 닿도록 bootY=8 (8+3=11)
  const legPositions = [
    { leftY: 0, leftH: 8, rightY: 3, rightH: 5, leftBootY: 8, rightBootY: 8 },
    { leftY: 0, leftH: 8, rightY: 1, rightH: 7, leftBootY: 8, rightBootY: 8 },
    { leftY: 3, leftH: 5, rightY: 0, rightH: 8, leftBootY: 8, rightBootY: 8 },
    { leftY: 1, leftH: 7, rightY: 0, rightH: 8, leftBootY: 8, rightBootY: 8 },
  ];

  const leg = legPositions[frame];

  return (
    <svg
      width={16 * px}
      height={LOWER_BODY_HEIGHT * px}
      viewBox="0 0 16 11"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pants base */}
      <rect x="5" y="0" width="6" height="3" fill={pantsColor} />

      {/* Left leg */}
      <rect x="5" y={leg.leftY} width="2" height={leg.leftH} fill={pantsColor} />
      <rect x="6" y={leg.leftY} width="1" height={leg.leftH} fill={pantsShadow} />
      <rect x="4" y={leg.leftBootY} width="3" height="3" fill={bootColor} />
      <rect x="4" y={leg.leftBootY + 2} width="3" height="1" fill="#2a2a3e" />

      {/* Right leg */}
      <rect x="9" y={leg.rightY} width="2" height={leg.rightH} fill={pantsColor} />
      <rect x="10" y={leg.rightY} width="1" height={leg.rightH} fill={pantsShadow} />
      <rect x="9" y={leg.rightBootY} width="3" height="3" fill={bootColor} />
      <rect x="9" y={leg.rightBootY + 2} width="3" height="1" fill="#2a2a3e" />
    </svg>
  );
}
