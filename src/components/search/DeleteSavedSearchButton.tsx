"use client";

import { useTransition } from "react";
import { Button, Popconfirm } from "antd";
import { deleteSavedSearchAction } from "@/app/(account)/tim-kiem-da-luu/actions";
import { useToast } from "@/components/feedback/useToast";

export function DeleteSavedSearchButton({ id }: { id: string }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSavedSearchAction(id);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Popconfirm title="Xoá tìm kiếm đã lưu này?" onConfirm={handleDelete} okText="Xoá" cancelText="Huỷ">
      <Button size="small" danger loading={isPending}>
        Xoá
      </Button>
    </Popconfirm>
  );
}
