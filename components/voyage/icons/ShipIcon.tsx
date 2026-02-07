interface IconProps {
  className?: string;
}

export function ShipIcon({ className = "w-6 h-6" }: IconProps) {
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
      {/* Hull */}
      <path d="M2 20l2-3h16l2 3" />
      {/* Deck */}
      <path d="M4 17l1-8h14l1 8" />
      {/* Cabin */}
      <rect x="8" y="11" width="8" height="4" rx="1" />
      {/* Mast */}
      <path d="M12 4v7" />
      {/* Flag */}
      <path d="M12 4l4 2-4 2" fill="currentColor" stroke="none" />
    </svg>
  );
}
