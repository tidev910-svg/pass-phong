import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Màu khớp Dorm Bulletin Board (src/theme/tokens.ts) — không dùng gradient
// theo skill ui-ux-style. Font vẫn dùng sans-serif hệ thống vì next/og
// (Satori) cần fetch buffer font riêng để dùng Baloo 2/Be Vietnam Pro, việc
// đó nằm ngoài phạm vi refactor UI thuần này.
export default function OpengraphImage() {
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
          background: "#F8F3E7",
          color: "#2B2A24",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            padding: "12px 32px",
            border: "4px solid #2B2A24",
            borderRadius: 12,
            background: "#FFFDF6",
            boxShadow: "10px 10px 0 rgba(43,42,36,0.9)",
          }}
        >
          🏠 Pass Phòng Cần Thơ
        </div>
        <div style={{ fontSize: 34, marginTop: 40, color: "#B77E1F", fontWeight: 700 }}>
          Đăng & tìm tin pass phòng nhanh chóng
        </div>
      </div>
    ),
    { ...size },
  );
}
