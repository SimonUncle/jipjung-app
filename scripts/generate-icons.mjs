import sharp from "sharp";
import { writeFileSync } from "fs";

// Submarine SVG icon for PWA
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0a0f1e"/>

  <!-- Deep ocean gradient background -->
  <rect x="32" y="32" width="448" height="448" rx="80" fill="url(#bgGrad)"/>

  <!-- Bubble decorations -->
  <circle cx="120" cy="160" r="12" fill="#87ceeb" opacity="0.3"/>
  <circle cx="90" cy="200" r="8" fill="#87ceeb" opacity="0.2"/>
  <circle cx="140" cy="130" r="6" fill="#87ceeb" opacity="0.25"/>
  <circle cx="380" cy="150" r="10" fill="#87ceeb" opacity="0.25"/>
  <circle cx="400" cy="190" r="6" fill="#87ceeb" opacity="0.2"/>

  <!-- Submarine body -->
  <ellipse cx="256" cy="296" rx="160" ry="64" fill="url(#subGrad)" stroke="#1e3a5f" stroke-width="4"/>

  <!-- Conning tower -->
  <rect x="216" y="210" width="80" height="86" rx="12" fill="url(#towerGrad)" stroke="#1e3a5f" stroke-width="3"/>

  <!-- Periscope -->
  <rect x="248" y="140" width="16" height="70" rx="4" fill="#2d4a6f"/>
  <circle cx="256" cy="132" r="14" fill="#4a90d9" stroke="#1e3a5f" stroke-width="2"/>
  <circle cx="256" cy="132" r="6" fill="#87ceeb"/>

  <!-- Propeller -->
  <ellipse cx="416" cy="296" rx="16" ry="36" fill="#1e3a5f"/>
  <ellipse cx="416" cy="296" rx="8" ry="28" fill="#2d4a6f"/>

  <!-- Windows -->
  <circle cx="160" cy="296" r="18" fill="#0a1628" stroke="#87ceeb" stroke-width="3" opacity="0.9"/>
  <circle cx="160" cy="296" r="10" fill="#87ceeb" opacity="0.6"/>
  <circle cx="216" cy="296" r="18" fill="#0a1628" stroke="#87ceeb" stroke-width="3" opacity="0.9"/>
  <circle cx="216" cy="296" r="10" fill="#87ceeb" opacity="0.6"/>
  <circle cx="296" cy="296" r="18" fill="#0a1628" stroke="#87ceeb" stroke-width="3" opacity="0.9"/>
  <circle cx="296" cy="296" r="10" fill="#87ceeb" opacity="0.6"/>
  <circle cx="352" cy="296" r="18" fill="#0a1628" stroke="#87ceeb" stroke-width="3" opacity="0.9"/>
  <circle cx="352" cy="296" r="10" fill="#87ceeb" opacity="0.6"/>

  <!-- Light beam from periscope -->
  <circle cx="256" cy="132" r="3" fill="white" opacity="0.8"/>

  <defs>
    <linearGradient id="bgGrad" x1="32" y1="32" x2="480" y2="480">
      <stop stop-color="#0f172a"/>
      <stop offset="0.5" stop-color="#0c1929"/>
      <stop offset="1" stop-color="#0a1628"/>
    </linearGradient>
    <linearGradient id="subGrad" x1="96" y1="232" x2="416" y2="360">
      <stop stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#1e40af"/>
    </linearGradient>
    <linearGradient id="towerGrad" x1="216" y1="210" x2="296" y2="296">
      <stop stop-color="#4a90d9"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
</svg>`;

// Generate icons
async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);

  // 512x512
  await sharp(svgBuffer).resize(512, 512).png().toFile("public/icon-512.png");
  console.log("Generated icon-512.png");

  // 192x192
  await sharp(svgBuffer).resize(192, 192).png().toFile("public/icon-192.png");
  console.log("Generated icon-192.png");

  // favicon 32x32
  await sharp(svgBuffer).resize(32, 32).png().toFile("public/favicon.png");
  console.log("Generated favicon.png");

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("Generated apple-touch-icon.png");

  console.log("All icons generated!");
}

generateIcons().catch(console.error);
