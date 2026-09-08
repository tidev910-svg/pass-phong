import type { ReactNode } from "react";

/**
 * Nhãn "băng keo washi" viết tay (Caveat) — mô phỏng mảnh giấy dán trên bảng
 * tin. CHỈ dùng ở 1-2 vị trí mỗi màn hình (skill ui-ux-style), không lạm
 * dụng — style thật nằm ở class `.tape-label` dùng chung trong globals.css.
 */
export function TapeLabel({ children }: { children: ReactNode }) {
  return <span className="tape-label">{children}</span>;
}
