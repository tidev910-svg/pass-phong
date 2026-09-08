"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "antd";
import { createSavedSearchAction } from "@/app/(account)/tim-kiem-da-luu/actions";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics/track";
import { useToast } from "@/components/feedback/useToast";
import type { CreateSavedSearchInput } from "@/domain/saved-searches/types";

export function SaveSearchButton({
  filter,
  isLoggedIn,
}: {
  filter: CreateSavedSearchInput;
  isLoggedIn: boolean;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link href="/dang-nhap">
        <Button>Đăng nhập để lưu tìm kiếm này</Button>
      </Link>
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await createSavedSearchAction(filter);
      if (result.ok) {
        toast.success("Đã lưu tìm kiếm. Xem lại ở mục “Tìm kiếm đã lưu”.");
        trackEvent(AnalyticsEvent.SavedSearchCreated);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={handleSave} loading={isPending}>
      Lưu tìm kiếm này
    </Button>
  );
}
