"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/feedback/useToast";

/**
 * Toast "đăng/sửa tin thành công" — đặt ở trang chi tiết tin (không phải ở
 * form) vì `createListingAction`/`updateListingAction` redirect() ngay
 * trong Server Action khi thành công, hàm không bao giờ trả về để form biết
 * mà tự bắn toast. Đọc cờ `?posted=1`/`?updated=1` gắn kèm redirect, bắn
 * toast đúng 1 lần rồi dọn query string (router.replace) để F5/back không
 * hiện lại toast cũ.
 *
 * `useEffect` ở đây hợp lệ (không phải case bị eslint `set-state-in-effect`
 * chặn) — đây là side-effect một lần sau mount (đọc query, gọi toast, điều
 * hướng), không phải setState đồng bộ theo state nội bộ component.
 */
export function ListingActionToast() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const posted = searchParams.get("posted");
  const updated = searchParams.get("updated");
  // Chặn bắn toast 2 lần — React StrictMode (dev) chạy effect 2 lần liên
  // tiếp lúc mount để lộ side-effect không an toàn; `ref` sống sót qua lần
  // chạy lại đó (không như closure/state), nên chỉ lần đầu thực sự bắn.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (posted) {
      firedRef.current = true;
      toast.success("Đã đăng tin thành công!");
      router.replace(window.location.pathname, { scroll: false });
    } else if (updated) {
      firedRef.current = true;
      toast.success("Đã lưu thay đổi tin đăng.");
      router.replace(window.location.pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi chính cờ query đổi, không phải mỗi khi router/toast đổi identity
  }, [posted, updated]);

  return null;
}
