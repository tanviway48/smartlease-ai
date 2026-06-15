import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SmartLease AI — Understand your lease. Negotiate with confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#6366F1",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 24,
          }}
        >
          🏠 SmartLease AI
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 400,
            textAlign: "center",
          }}
        >
          Understand your lease. Negotiate with confidence.
        </div>
      </div>
    ),
    { ...size }
  );
}
