import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 다크 테마 색상
        dark: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#1e1e2e",
          muted: "#3a3a4a",
        },
        // 산/등반 테마 색상
        mountain: {
          base: "#1a1a2e",
          mid: "#16213e",
          peak: "#0f3460",
          snow: "#e8e8e8",
        },
        // 캠프파이어 색상
        fire: {
          warm: "#ff6b35",
          glow: "#f7931e",
          ember: "#c1272d",
        },
        // 진행도/강조 색상
        accent: {
          primary: "#4ade80",
          secondary: "#22d3ee",
        },
        // Getting Over It 스타일 지형 색상
        terrain: {
          dirt: "#6B4423",
          dirtLight: "#8B6914",
          dirtDark: "#4A3219",
          rock: "#5A5A5A",
          rockLight: "#7A7A7A",
          rockDark: "#3A3A3A",
          snow: "#E8E8E8",
          ice: "#B8D4E3",
          sky: "#1a1a2e",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "flicker": "flicker 0.5s ease-in-out infinite alternate",
        "fall": "fall 2s ease-in forwards",
        "climb": "climb 60s linear forwards",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        fall: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "100%": { transform: "translateY(300px) rotate(180deg)" },
        },
        climb: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
