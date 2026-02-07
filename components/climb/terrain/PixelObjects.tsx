"use client";

// Pixel scale
const PX = 4;

// Tree (Forest zone)
export function PixelTree({ variant = 0 }: { variant?: number }) {
  const trunkColor = "#5d4037";
  const leafColor = variant === 0 ? "#2d5a27" : "#3d7a37";

  return (
    <svg width={12 * PX} height={20 * PX} viewBox="0 0 12 20" style={{ imageRendering: "pixelated" }}>
      {/* Leaves */}
      <rect x="3" y="0" width="6" height="3" fill={leafColor} />
      <rect x="2" y="3" width="8" height="3" fill={leafColor} />
      <rect x="1" y="6" width="10" height="4" fill={leafColor} />
      <rect x="2" y="10" width="8" height="2" fill={leafColor} />
      {/* Trunk */}
      <rect x="5" y="12" width="2" height="8" fill={trunkColor} />
    </svg>
  );
}

// Bush/Grass (Forest zone)
export function PixelBush() {
  return (
    <svg width={8 * PX} height={6 * PX} viewBox="0 0 8 6" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="4" height="2" fill="#3d7a37" />
      <rect x="0" y="2" width="8" height="4" fill="#2d5a27" />
      <rect x="1" y="1" width="2" height="2" fill="#4a8a47" />
      <rect x="5" y="1" width="2" height="2" fill="#4a8a47" />
    </svg>
  );
}

// Flower (Forest zone)
export function PixelFlower({ color = "#e74c3c" }: { color?: string }) {
  return (
    <svg width={4 * PX} height={6 * PX} viewBox="0 0 4 6" style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="0" width="2" height="2" fill={color} />
      <rect x="0" y="1" width="1" height="1" fill={color} />
      <rect x="3" y="1" width="1" height="1" fill={color} />
      <rect x="1" y="1" width="2" height="1" fill="#f1c40f" />
      <rect x="1" y="2" width="2" height="4" fill="#2d5a27" />
    </svg>
  );
}

// Rock (Mountain zone)
export function PixelRock({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const dims = {
    small: { w: 6, h: 4 },
    medium: { w: 10, h: 6 },
    large: { w: 14, h: 10 },
  };
  const { w, h } = dims[size];
  const rockColor = "#6b7280";
  const shadowColor = "#4b5563";
  const highlightColor = "#9ca3af";

  if (size === "small") {
    return (
      <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="0" width="4" height="2" fill={highlightColor} />
        <rect x="0" y="2" width="6" height="2" fill={rockColor} />
        <rect x="0" y="3" width="2" height="1" fill={shadowColor} />
      </svg>
    );
  }

  if (size === "large") {
    return (
      <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
        <rect x="4" y="0" width="6" height="2" fill={highlightColor} />
        <rect x="2" y="2" width="10" height="3" fill={rockColor} />
        <rect x="0" y="5" width="14" height="5" fill={rockColor} />
        <rect x="0" y="7" width="4" height="3" fill={shadowColor} />
        <rect x="10" y="3" width="2" height="2" fill={highlightColor} />
      </svg>
    );
  }

  return (
    <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="6" height="2" fill={highlightColor} />
      <rect x="0" y="2" width="10" height="4" fill={rockColor} />
      <rect x="0" y="4" width="3" height="2" fill={shadowColor} />
    </svg>
  );
}

// Cactus (Desert zone)
export function PixelCactus({ variant = 0 }: { variant?: number }) {
  const cactusColor = "#27ae60";
  const darkColor = "#1e8449";

  if (variant === 1) {
    // Small cactus
    return (
      <svg width={6 * PX} height={12 * PX} viewBox="0 0 6 12" style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="2" height="12" fill={cactusColor} />
        <rect x="0" y="4" width="2" height="4" fill={cactusColor} />
        <rect x="4" y="6" width="2" height="4" fill={cactusColor} />
        <rect x="2" y="1" width="1" height="2" fill={darkColor} />
      </svg>
    );
  }

  // Tall cactus
  return (
    <svg width={8 * PX} height={16 * PX} viewBox="0 0 8 16" style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="2" height="16" fill={cactusColor} />
      <rect x="0" y="4" width="3" height="2" fill={cactusColor} />
      <rect x="0" y="4" width="2" height="6" fill={cactusColor} />
      <rect x="5" y="8" width="3" height="2" fill={cactusColor} />
      <rect x="6" y="6" width="2" height="6" fill={cactusColor} />
      <rect x="3" y="2" width="1" height="3" fill={darkColor} />
    </svg>
  );
}

// Sand dune (Desert zone)
export function PixelSandDune() {
  return (
    <svg width={20 * PX} height={6 * PX} viewBox="0 0 20 6" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="12" height="2" fill="#f4d03f" />
      <rect x="2" y="2" width="16" height="2" fill="#d4ac0d" />
      <rect x="0" y="4" width="20" height="2" fill="#b7950b" />
    </svg>
  );
}

// Skull/Bone (Desert zone)
export function PixelBone() {
  return (
    <svg width={8 * PX} height={4 * PX} viewBox="0 0 8 4" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="1" width="4" height="2" fill="#f5f5f5" />
      <rect x="0" y="0" width="2" height="2" fill="#f5f5f5" />
      <rect x="6" y="0" width="2" height="2" fill="#f5f5f5" />
      <rect x="0" y="2" width="2" height="2" fill="#e0e0e0" />
      <rect x="6" y="2" width="2" height="2" fill="#e0e0e0" />
    </svg>
  );
}

// Snow pile (Snow zone)
export function PixelSnowPile() {
  return (
    <svg width={12 * PX} height={6 * PX} viewBox="0 0 12 6" style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="6" height="2" fill="#ffffff" />
      <rect x="1" y="2" width="10" height="2" fill="#f0f0f0" />
      <rect x="0" y="4" width="12" height="2" fill="#e8f4f8" />
    </svg>
  );
}

// Icicle (Snow zone)
export function PixelIcicle() {
  return (
    <svg width={4 * PX} height={12 * PX} viewBox="0 0 4 12" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="0" width="4" height="4" fill="#a8d8ea" />
      <rect x="1" y="4" width="2" height="4" fill="#87ceeb" />
      <rect x="1" y="8" width="2" height="2" fill="#5dade2" />
      <rect x="1" y="10" width="1" height="2" fill="#3498db" />
    </svg>
  );
}

// Dead tree (Wasteland zone)
export function PixelDeadTree() {
  const color = "#5d4037";
  const darkColor = "#3e2723";

  return (
    <svg width={10 * PX} height={16 * PX} viewBox="0 0 10 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="2" height="16" fill={color} />
      <rect x="0" y="2" width="4" height="2" fill={color} />
      <rect x="0" y="0" width="2" height="2" fill={darkColor} />
      <rect x="6" y="4" width="4" height="2" fill={color} />
      <rect x="8" y="2" width="2" height="2" fill={darkColor} />
      <rect x="2" y="8" width="2" height="2" fill={color} />
    </svg>
  );
}

// Tent (Base camp zone)
export function PixelTent({ scale = 1 }: { scale?: number }) {
  const s = PX * scale;

  return (
    <svg width={16 * s} height={14 * s} viewBox="0 0 16 14" style={{ imageRendering: "pixelated" }}>
      {/* Tent body */}
      <rect x="7" y="0" width="2" height="2" fill="#e74c3c" />
      <rect x="5" y="2" width="6" height="2" fill="#e74c3c" />
      <rect x="3" y="4" width="10" height="2" fill="#c0392b" />
      <rect x="1" y="6" width="14" height="4" fill="#c0392b" />
      <rect x="0" y="10" width="16" height="4" fill="#922b21" />
      {/* Door */}
      <rect x="6" y="8" width="4" height="6" fill="#1a1a2e" />
      {/* Pole */}
      <rect x="7" y="0" width="2" height="1" fill="#8b4513" />
    </svg>
  );
}

// Flag (Base camp zone)
export function PixelFlag() {
  return (
    <svg width={6 * PX} height={16 * PX} viewBox="0 0 6 16" style={{ imageRendering: "pixelated" }}>
      {/* Pole */}
      <rect x="0" y="0" width="1" height="16" fill="#8b4513" />
      {/* Flag */}
      <rect x="1" y="1" width="5" height="5" fill="#e74c3c" />
      <rect x="2" y="2" width="3" height="3" fill="#f39c12" />
      {/* Animation handled by CSS */}
    </svg>
  );
}

// Star (Night sky)
export function PixelStar({ size = 1 }: { size?: number }) {
  return (
    <svg width={2 * PX * size} height={2 * PX * size} viewBox="0 0 2 2" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="0" width="2" height="2" fill="#ffffff" />
    </svg>
  );
}

// Moon (Night sky)
export function PixelMoon() {
  return (
    <svg width={8 * PX} height={8 * PX} viewBox="0 0 8 8" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="0" width="4" height="2" fill="#f4f4dc" />
      <rect x="0" y="2" width="6" height="4" fill="#f4f4dc" />
      <rect x="2" y="6" width="4" height="2" fill="#f4f4dc" />
      <rect x="6" y="2" width="2" height="4" fill="#f4f4dc" />
      {/* Craters */}
      <rect x="2" y="3" width="1" height="1" fill="#d4d4bc" />
      <rect x="4" y="5" width="1" height="1" fill="#d4d4bc" />
    </svg>
  );
}

// Cloud
export function PixelCloud({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const w = size === "small" ? 8 : size === "medium" ? 12 : 16;
  const h = size === "small" ? 4 : size === "medium" ? 6 : 8;

  if (size === "small") {
    return (
      <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="2" fill="#ffffff" opacity="0.8" />
        <rect x="0" y="2" width="8" height="2" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }

  if (size === "large") {
    return (
      <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
        <rect x="4" y="0" width="4" height="2" fill="#ffffff" opacity="0.8" />
        <rect x="2" y="2" width="10" height="2" fill="#ffffff" opacity="0.8" />
        <rect x="0" y="4" width="16" height="4" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="4" height="2" fill="#ffffff" opacity="0.8" />
      <rect x="1" y="2" width="10" height="2" fill="#ffffff" opacity="0.8" />
      <rect x="0" y="4" width="12" height="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

// Sun
export function PixelSun() {
  return (
    <svg width={10 * PX} height={10 * PX} viewBox="0 0 10 10" style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="4" height="1" fill="#f1c40f" />
      <rect x="0" y="3" width="1" height="4" fill="#f1c40f" />
      <rect x="9" y="3" width="1" height="4" fill="#f1c40f" />
      <rect x="3" y="9" width="4" height="1" fill="#f1c40f" />
      <rect x="2" y="2" width="6" height="6" fill="#f39c12" />
      <rect x="3" y="3" width="4" height="4" fill="#f1c40f" />
    </svg>
  );
}

// Eagle (flying bird)
export function PixelEagle({ frame = 0 }: { frame?: number }) {
  const color = "#5d4037";

  if (frame === 0) {
    return (
      <svg width={12 * PX} height={6 * PX} viewBox="0 0 12 6" style={{ imageRendering: "pixelated" }}>
        <rect x="5" y="2" width="2" height="2" fill={color} />
        <rect x="0" y="0" width="5" height="2" fill={color} />
        <rect x="7" y="0" width="5" height="2" fill={color} />
        <rect x="4" y="4" width="4" height="2" fill={color} />
      </svg>
    );
  }

  return (
    <svg width={12 * PX} height={6 * PX} viewBox="0 0 12 6" style={{ imageRendering: "pixelated" }}>
      <rect x="5" y="2" width="2" height="2" fill={color} />
      <rect x="0" y="3" width="5" height="2" fill={color} />
      <rect x="7" y="3" width="5" height="2" fill={color} />
      <rect x="4" y="4" width="4" height="2" fill={color} />
    </svg>
  );
}
