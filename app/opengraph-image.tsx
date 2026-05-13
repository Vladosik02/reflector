import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Reflector — найди своего двойника по фото";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#FAFAF7",
          color: "#0A0A0A",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
            <circle cx="8" cy="11" r="6" stroke="#0A0A0A" strokeWidth="1.6" />
            <circle cx="14" cy="11" r="6" stroke="#0A0A0A" strokeWidth="1.6" />
          </svg>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Reflector</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              fontSize: 22,
              color: "#5B5BD6",
              fontWeight: 500,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            AI · Распознавание лиц
          </span>
          <h1
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontWeight: 600,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            Найдите своего двойника за 10 секунд
          </h1>
          <p style={{ fontSize: 26, color: "#4D4D48", margin: 0, maxWidth: 900 }}>
            Одно фото — топ совпадений из публичных баз, моделей, спортсменов и архивов.
          </p>
        </div>
      </div>
    ),
    size,
  );
}
