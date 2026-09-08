import type { ThemeConfig } from "antd";
import {
  COLOR_BORDER,
  COLOR_FOREST,
  COLOR_FOREST_DARK,
  COLOR_INK,
  COLOR_INK_SOFT,
  COLOR_MUSTARD,
  COLOR_PAPER_CARD,
  FONT_BODY,
  FONT_HEADING,
  RADIUS_BOARD,
  RADIUS_BUTTON,
  RADIUS_INPUT,
  RADIUS_PILL,
} from "./tokens";

/**
 * Nguồn DUY NHẤT định nghĩa thẩm mỹ antd theo Dorm Bulletin Board:
 * forest làm màu nhấn chính, mustard làm màu nhấn phụ (thay cho antd
 * warning/gold mặc định) — không lặp giá trị này ở component riêng lẻ.
 *
 * Phần "hard offset shadow" (không blur) cho Button/Card không tự nhiên có
 * trong token system của antd (antd chỉ hỗ trợ 1 box-shadow mờ mặc định) —
 * áp dụng bổ sung qua CSS thường ở `globals.css`, ở đây chỉ tắt shadow mặc
 * định của antd (`primaryShadow: "none"`) để 2 lớp không đè lên nhau.
 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: COLOR_FOREST,
    colorInfo: COLOR_FOREST,
    colorWarning: COLOR_MUSTARD,
    colorText: COLOR_INK,
    colorTextSecondary: COLOR_INK_SOFT,
    colorTextDescription: COLOR_INK_SOFT,
    colorBorder: COLOR_BORDER,
    colorBorderSecondary: COLOR_BORDER,
    colorBgContainer: COLOR_PAPER_CARD,
    // antd không tự suy colorLink từ colorPrimary — phải set tay, nếu không
    // Typography.Link (vd số điện thoại/link liên hệ ở ContactBadge) sẽ ra
    // xanh dương mặc định, thành màu nhấn thứ 3 ngoài ý muốn.
    colorLink: COLOR_FOREST,
    colorLinkHover: COLOR_FOREST_DARK,
    colorLinkActive: COLOR_FOREST_DARK,
    borderRadius: RADIUS_INPUT,
    fontFamily: FONT_BODY,
  },
  components: {
    Card: {
      borderRadiusLG: RADIUS_BOARD,
    },
    Button: {
      borderRadius: RADIUS_BUTTON,
      // 40 -> 44: vùng chạm tối thiểu khuyến nghị cho mobile (WCAG/Apple HIG
      // 44x44px) — phát hiện qua Playwright touch-target audit (2026-09-09,
      // xem memory `pass-phong-project-status`), hầu hết nút chính (Tìm
      // phòng, Đăng nhập/Đăng ký, Lưu thay đổi...) đều thấp hơn 44px. Chỉ
      // ảnh hưởng size mặc định (`controlHeightSM`/`controlHeightLG` không
      // đổi) — các nút `size="small"` (vd "Xoá" ở saved-search) không đổi.
      controlHeight: 44,
      primaryShadow: "none",
      dangerShadow: "none",
      defaultShadow: "none",
    },
    Input: {
      borderRadius: RADIUS_INPUT,
      controlHeight: 40,
    },
    InputNumber: {
      borderRadius: RADIUS_INPUT,
      controlHeight: 40,
    },
    Select: {
      borderRadius: RADIUS_INPUT,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: RADIUS_INPUT,
      controlHeight: 40,
    },
    Tag: {
      borderRadiusSM: RADIUS_PILL, // tag khu vực/trạng thái dạng pill
    },
    // HomeFilterBoard (2 tab "Theo khu vực"/"Theo vị trí gần tôi") — chỉ cần
    // đổi màu chữ tab chưa active (mặc định antd dùng colorText/ink, quá đậm
    // so với tab đang active) + độ dày gạch chân active (mặc định 2px). Màu
    // chữ tab active + màu gạch chân ĐÃ tự đúng forest sẵn (đều mặc định suy
    // ra từ `colorPrimary` ở token gốc phía trên), không cần set lại.
    Tabs: {
      itemColor: COLOR_INK_SOFT,
      lineWidthBold: 3,
      titleFontSize: 15,
      horizontalItemGutter: 28,
      fontFamily: FONT_HEADING,
    },
  },
};
