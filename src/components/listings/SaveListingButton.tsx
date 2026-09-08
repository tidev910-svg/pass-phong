"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "antd";
import { PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import { toggleListingSaveAction } from "@/app/_actions/listing-save-actions";
import { useToast } from "@/components/feedback/useToast";

/**
 * Nút "Lưu tin" (bookmark 1 tin cụ thể) — dùng icon ghim (Pushpin, cùng motif
 * "ghim lên bảng tin" đã dùng ở toast info) thay vì icon trái tim/bookmark
 * chung chung, khớp tinh thần Dorm Bulletin Board hơn dù đặt trong ngữ cảnh
 * card kiểu MXH. Optimistic update — đổi trạng thái/số đếm ngay khi bấm, lùi
 * lại nếu action thất bại.
 *
 * QUAN TRỌNG: component này không tự `stopPropagation`/`preventDefault` —
 * nơi gọi phải đặt nó NGOÀI vùng `<Link>` bọc card (xem `FeedPostCard`,
 * `ListingDetailView`), không lồng button vào trong `<a>` (HTML không hợp lệ
 * + click sẽ vừa toggle vừa điều hướng).
 */
export function SaveListingButton({
  listingId,
  initialSaved,
  initialCount,
  isLoggedIn,
}: {
  listingId: string;
  initialSaved: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);

  if (!isLoggedIn) {
    return (
      <Link href="/dang-nhap">
        <Button type="text" icon={<PushpinOutlined />}>
          {count > 0 ? `Lưu (${count})` : "Lưu tin"}
        </Button>
      </Link>
    );
  }

  function handleClick() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setCount((c) => Math.max(0, c + (nextSaved ? 1 : -1)));

    startTransition(async () => {
      const result = await toggleListingSaveAction(listingId, nextSaved);
      if (!result.ok) {
        setSaved(!nextSaved);
        setCount((c) => Math.max(0, c + (nextSaved ? -1 : 1)));
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="text"
      icon={saved ? <PushpinFilled style={{ color: "var(--mustard-dark)" }} /> : <PushpinOutlined />}
      onClick={handleClick}
      loading={isPending}
    >
      {saved ? "Đã lưu" : "Lưu tin"}
      {count > 0 ? ` · ${count}` : ""}
    </Button>
  );
}
