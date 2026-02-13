// 잠수함 아이콘 SVG

interface SubmarineIconProps {
  className?: string;
  size?: number;
}

export function SubmarineIcon({ className = "", size = 48 }: SubmarineIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 잠수함 몸체 */}
      <ellipse
        cx="24"
        cy="28"
        rx="18"
        ry="8"
        fill="url(#submarineGradient)"
        stroke="#1e3a5f"
        strokeWidth="1.5"
      />

      {/* 함교 (conning tower) */}
      <rect
        x="18"
        y="18"
        width="12"
        height="10"
        rx="2"
        fill="url(#towerGradient)"
        stroke="#1e3a5f"
        strokeWidth="1"
      />

      {/* 잠망경 */}
      <rect
        x="23"
        y="10"
        width="2"
        height="8"
        fill="#2d4a6f"
      />
      <circle cx="24" cy="9" r="2" fill="#4a90d9" />

      {/* 프로펠러 */}
      <ellipse cx="42" cy="28" rx="2" ry="4" fill="#1e3a5f" />

      {/* 창문들 */}
      <circle cx="12" cy="28" r="2" fill="#87ceeb" opacity="0.8" />
      <circle cx="18" cy="28" r="2" fill="#87ceeb" opacity="0.8" />
      <circle cx="30" cy="28" r="2" fill="#87ceeb" opacity="0.8" />
      <circle cx="36" cy="28" r="2" fill="#87ceeb" opacity="0.8" />

      {/* 물방울/버블 효과 */}
      <circle cx="8" cy="20" r="1.5" fill="#87ceeb" opacity="0.4" />
      <circle cx="5" cy="24" r="1" fill="#87ceeb" opacity="0.3" />
      <circle cx="10" cy="16" r="1" fill="#87ceeb" opacity="0.3" />

      <defs>
        <linearGradient id="submarineGradient" x1="6" y1="20" x2="42" y2="36">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="towerGradient" x1="18" y1="18" x2="30" y2="28">
          <stop stopColor="#4a90d9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SubmarineIcon;
