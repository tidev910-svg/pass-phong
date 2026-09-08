"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Popconfirm, Space } from "antd";
import {
  confirmListingSuccessAction,
  deleteOwnListingAction,
} from "@/app/(public)/tin/[id]/actions";
import { useToast } from "@/components/feedback/useToast";

/** Nút thao tác dành riêng cho chủ tin — chỉ render khi user đang xem là chủ tin. */
export function ListingOwnerActions({ listingId }: { listingId: string }) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  function handleConfirmSuccess() {
    startTransition(async () => {
      const result = await confirmListingSuccessAction(listingId);
      if (result.ok) {
        toast.success("Đã xác nhận pass phòng thành công!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOwnListingAction(listingId);
      if (result.ok) {
        toast.success("Đã xoá tin đăng.");
        setDeleted(true);
        router.push("/");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (deleted) return null;

  return (
    <Space wrap>
      <Popconfirm
        title="Xác nhận đã pass phòng thành công?"
        description="Tin sẽ được đánh dấu đã pass và không còn hiển thị trong kết quả tìm kiếm."
        onConfirm={handleConfirmSuccess}
        okText="Xác nhận"
        cancelText="Huỷ"
      >
        <Button type="primary" loading={isPending}>
          Xác nhận đã pass thành công
        </Button>
      </Popconfirm>
      <Popconfirm
        title="Xoá tin đăng này?"
        description="Thao tác không thể hoàn tác."
        onConfirm={handleDelete}
        okText="Xoá tin"
        okButtonProps={{ danger: true }}
        cancelText="Huỷ"
      >
        <Button danger loading={isPending}>
          Xoá tin
        </Button>
      </Popconfirm>
    </Space>
  );
}
