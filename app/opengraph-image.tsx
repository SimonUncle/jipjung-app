import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Focus Submarine - 감성 집중 타이머";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0c4a6e 70%, #0a0a0f 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 물방울/파티클 효과 */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 200,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            right: 300,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "rgba(34, 211, 238, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 150,
            left: 400,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 300,
            left: 100,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(34, 211, 238, 0.15)",
          }}
        />

        {/* 잠수함 아이콘 (텍스트 기반) */}
        <div
          style={{
            fontSize: 72,
            marginBottom: 24,
            display: "flex",
          }}
        >
          🤿
        </div>

        {/* 타이틀 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Focus
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#22d3ee",
              letterSpacing: "-0.02em",
            }}
          >
            Submarine
          </span>
        </div>

        {/* 설명 */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(147, 197, 253, 0.8)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          집중하면 잠수함이 목적지를 향해 잠항하는 감성 집중 타이머
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "rgba(148, 163, 184, 0.6)",
            display: "flex",
          }}
        >
          jipjung.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
