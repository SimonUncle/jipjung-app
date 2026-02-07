interface IconProps {
  className?: string;
}

export function AnchorIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ring at top */}
      <circle cx="12" cy="5" r="2" />
      {/* Vertical line */}
      <path d="M12 7v14" />
      {/* Horizontal bar */}
      <path d="M9 10h6" />
      {/* Anchor arms */}
      <path d="M4 19c0-4 3.5-7 8-7s8 3 8 7" />
      {/* Arrow tips */}
      <path d="M4 19l2-2" />
      <path d="M20 19l-2-2" />
    </svg>
  );
}
