"use client";

interface ClimberCharacterProps {
  className?: string;
}

export function ClimberCharacter({ className = "" }: ClimberCharacterProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Getting Over It 스타일 캐릭터: 항아리 + 등반가 + 피켈 (개선된 버전) */}
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        className="drop-shadow-lg"
      >
        <defs>
          {/* 항아리 그라데이션 */}
          <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5A2B" />
            <stop offset="40%" stopColor="#6B4423" />
            <stop offset="100%" stopColor="#4A2A15" />
          </linearGradient>

          {/* 항아리 하이라이트 */}
          <linearGradient id="potHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A0724A" />
            <stop offset="50%" stopColor="#8B5A2B" />
            <stop offset="100%" stopColor="#5A3A1A" />
          </linearGradient>

          {/* 피부색 그라데이션 */}
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDBAC" />
            <stop offset="100%" stopColor="#E8C090" />
          </linearGradient>

          {/* 헬멧 그라데이션 */}
          <linearGradient id="helmetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff8050" />
            <stop offset="50%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="#cc5020" />
          </linearGradient>

          {/* 금속 그라데이션 (피켈) */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#888" />
            <stop offset="50%" stopColor="#666" />
            <stop offset="100%" stopColor="#444" />
          </linearGradient>

          {/* 그림자 효과 */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 항아리 (솥) - 더 입체적으로 */}
        <g filter="url(#shadow)">
          {/* 항아리 본체 */}
          <ellipse cx="40" cy="82" rx="26" ry="16" fill="url(#potGradient)" />
          <ellipse cx="40" cy="74" rx="24" ry="12" fill="url(#potHighlight)" />

          {/* 항아리 테두리 */}
          <ellipse cx="40" cy="74" rx="24" ry="12" fill="none" stroke="#5A3A1A" strokeWidth="1" />

          {/* 항아리 내부 그림자 */}
          <ellipse cx="40" cy="74" rx="18" ry="7" fill="#3A2A15" opacity="0.4" />

          {/* 항아리 하이라이트 */}
          <path
            d="M20 78 Q25 72 30 78"
            fill="none"
            stroke="#B8845A"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* 몸통 (상체가 항아리에서 나옴) */}
        <rect x="33" y="50" width="14" height="22" rx="3" fill="#3A3A3A" />
        <rect x="35" y="52" width="10" height="18" rx="2" fill="#4A4A4A" />

        {/* 어깨 */}
        <ellipse cx="33" cy="52" rx="4" ry="3" fill="#3A3A3A" />
        <ellipse cx="47" cy="52" rx="4" ry="3" fill="#3A3A3A" />

        {/* 머리 */}
        <g filter="url(#shadow)">
          <circle cx="40" cy="38" r="12" fill="url(#skinGradient)" />

          {/* 귀 */}
          <ellipse cx="28" cy="38" rx="2" ry="3" fill="#E8C090" />
          <ellipse cx="52" cy="38" rx="2" ry="3" fill="#E8C090" />
        </g>

        {/* 얼굴 */}
        {/* 눈썹 */}
        <path d="M34 32 Q36 30 38 32" fill="none" stroke="#555" strokeWidth="1" />
        <path d="M42 32 Q44 30 46 32" fill="none" stroke="#555" strokeWidth="1" />

        {/* 눈 */}
        <ellipse cx="36" cy="36" rx="2" ry="2.5" fill="#333" />
        <ellipse cx="44" cy="36" rx="2" ry="2.5" fill="#333" />
        <circle cx="35" cy="35" r="0.8" fill="white" opacity="0.8" />
        <circle cx="43" cy="35" r="0.8" fill="white" opacity="0.8" />

        {/* 코 */}
        <path d="M40 38 L40 41" stroke="#D8B090" strokeWidth="2" strokeLinecap="round" />

        {/* 입 (약간 힘든 표정) */}
        <path
          d="M36 44 Q40 46 44 44"
          fill="none"
          stroke="#8B6050"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 헬멧 */}
        <g filter="url(#shadow)">
          <path
            d="M28 34 Q28 20 40 20 Q52 20 52 34"
            fill="url(#helmetGradient)"
          />
          {/* 헬멧 테두리 */}
          <path
            d="M28 34 Q28 20 40 20 Q52 20 52 34"
            fill="none"
            stroke="#aa4020"
            strokeWidth="1"
          />
          {/* 헬멧 상단 */}
          <ellipse cx="40" cy="20" rx="8" ry="3" fill="#ff9060" />
          {/* 헬멧 반사광 */}
          <path
            d="M32 26 Q36 23 40 26"
            fill="none"
            stroke="#ffa070"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* 왼팔 (피켈 잡는 손) */}
        <path
          d="M33 54 L18 38"
          stroke="url(#skinGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* 팔 그림자 */}
        <path
          d="M33 54 L18 38"
          stroke="#D8B090"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 피켈 (등반 도구) - 더 길고 디테일하게 */}
        <g filter="url(#shadow)">
          {/* 피켈 자루 */}
          <line x1="18" y1="38" x2="4" y2="12" stroke="#5A4A3A" strokeWidth="4" strokeLinecap="round" />
          <line x1="18" y1="38" x2="4" y2="12" stroke="#6A5A4A" strokeWidth="2" strokeLinecap="round" />

          {/* 피켈 머리 (곡괭이 부분) */}
          <path
            d="M4 12 Q0 8 -2 14 L4 18 Z"
            fill="url(#metalGradient)"
          />
          {/* 피켈 스파이크 */}
          <line x1="4" y1="12" x2="10" y2="6" stroke="#888" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="12" x2="10" y2="6" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />

          {/* 피켈 끝 부분 */}
          <circle cx="4" cy="12" r="2" fill="#777" />
        </g>

        {/* 오른팔 */}
        <path
          d="M47 54 L60 46"
          stroke="url(#skinGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* 손 */}
        <circle cx="60" cy="46" r="4" fill="url(#skinGradient)" />
        <circle cx="60" cy="46" r="3" fill="#E8C090" />

        {/* 땀방울 효과 */}
        <circle cx="50" cy="30" r="1.5" fill="#88ccff" opacity="0.7" />
        <circle cx="52" cy="33" r="1" fill="#88ccff" opacity="0.5" />
      </svg>

      {/* 미세한 움직임 효과 */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent-primary/50 rounded-full animate-ping" />
    </div>
  );
}
