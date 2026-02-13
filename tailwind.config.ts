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
        // 진행도/강조 색상
        accent: {
          primary: "#4ade80",
          secondary: "#22d3ee",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
