"use client";

import { App } from "antd";
import { CheckCircleFilled, ExclamationCircleFilled, PushpinFilled } from "@ant-design/icons";

/**
 * Toast dùng chung cho toàn app — bọc `message`/`notification` của antd
 * (`App.useApp()`) để mọi nơi gọi cùng 1 icon/duration theo đúng 3 loại của
 * loading-toast-feedback-style, KHÔNG lặp lại icon/duration ở từng nơi gọi:
 * - success: forest, tick, tự ẩn ~4s (mặc định antd) — dùng `message`.
 * - error: danger, dấu chấm than, KHÔNG tự ẩn (`duration: 0`) — người dùng
 *   cần thời gian đọc/xử lý lỗi. Dùng `notification` (KHÔNG phải `message`)
 *   — đúng theo skill loading-toast-feedback-style: `message` chỉ hợp với
 *   thông báo tự ẩn, lỗi "persistent, manually-dismissed" phải dùng
 *   `notification` vì nó có sẵn nút đóng (X). `message` không có nút đóng
 *   nào cả — bản trước dùng `message.open({duration:0})` cho lỗi khiến
 *   thông báo kẹt vĩnh viễn, không cách nào tắt được (xác nhận qua DOM thật:
 *   0 nút đóng, vẫn còn sau 7s) — đây chính là bug "thông báo không tự biến
 *   mất" đã báo, không phải chỉ là thiếu auto-dismiss.
 * - info: mustard, icon ghim (gắn với motif bảng tin), tự ẩn ~4s — `message`.
 * Màu sắc/viền/shadow của toast được restyle toàn cục qua CSS nhắm vào class
 * `.ant-message-*`/`.ant-notification-*` (xem globals.css) — ở đây chỉ set
 * icon + duration.
 */
export function useToast() {
  const { message, notification } = App.useApp();

  return {
    success(content: string) {
      message.open({ type: "success", content, icon: <CheckCircleFilled />, duration: 4 });
    },
    error(content: string) {
      notification.open({
        type: "error",
        title: content,
        icon: <ExclamationCircleFilled />,
        duration: 0,
      });
    },
    info(content: string) {
      message.open({ type: "info", content, icon: <PushpinFilled />, duration: 4 });
    },
  };
}
