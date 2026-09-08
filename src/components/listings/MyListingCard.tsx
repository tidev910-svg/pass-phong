"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Popconfirm, Tag } from "antd";
import {
  confirmListingSuccessAction,
  deleteOwnListingAction,
} from "@/app/(public)/tin/[id]/actions";
import { useToast } from "@/components/feedback/useToast";
import { ListingCard, type ListingCardViewModel } from "./ListingCard";
import styles from "./MyListingCard.module.css";

export interface MyListingItem extends ListingCardViewModel {
  /** Tin đã xoá không đi qua component này — `listByUser` đã lọc bỏ ở nguồn. */
  status: "active" | "passed";
}

/**
 * Thẻ tin ở tab "Tin của tôi" — bọc `ListingCard` (không sửa gì bên trong nó
 * ngoài prop `mutedPrice` đã thêm), gắn thêm badge trạng thái + hàng nút thao
 * tác khác nhau theo status. Tái dùng đúng server action đã có ở trang chi
 * tiết tin (`confirmListingSuccessAction`, `deleteOwnListingAction`) — không
 * viết lại logic xác nhận-pass/xoá.
 */
export function MyListingCard({ item }: { item: MyListingItem }) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMarkPassed() {
    startTransition(async () => {
      const result = await confirmListingSuccessAction(item.id);
      if (result.ok) {
        toast.success("Đã đánh dấu tin này là đã pass.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOwnListingAction(item.id);
      if (result.ok) {
        toast.success("Đã xoá tin đăng.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.statusBadge}>
        <Tag color={item.status === "active" ? "success" : "default"}>
          {item.status === "active" ? "Đang hiển thị" : "Đã pass"}
        </Tag>
      </div>

      <ListingCard item={item} mutedPrice={item.status === "passed"} />

      <div className={styles.actions}>
        {item.status === "active" ? (
          <>
            <Link href={`/tin/${item.id}/sua`}>
              <Button size="small">Sửa tin</Button>
            </Link>
            <Popconfirm
              title="Đánh dấu tin này đã pass?"
              description="Không thể hoàn tác — muốn đăng lại phải tạo tin mới."
              onConfirm={handleMarkPassed}
              okText="Đánh dấu"
              cancelText="Huỷ"
            >
              <Button size="small" loading={isPending}>
                Đánh dấu đã pass
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Xoá tin này?"
              description="Thao tác không thể hoàn tác."
              onConfirm={handleDelete}
              okText="Xoá"
              okButtonProps={{ danger: true }}
              cancelText="Huỷ"
            >
              <Button size="small" danger loading={isPending}>
                Xoá
              </Button>
            </Popconfirm>
          </>
        ) : (
          <>
            <Link href={`/dang-tin?repostFrom=${item.id}`}>
              <Button size="small" type="primary">
                Đăng lại tin
              </Button>
            </Link>
            <Popconfirm
              title="Xoá tin này?"
              description="Thao tác không thể hoàn tác."
              onConfirm={handleDelete}
              okText="Xoá"
              okButtonProps={{ danger: true }}
              cancelText="Huỷ"
            >
              <Button size="small" danger loading={isPending}>
                Xoá
              </Button>
            </Popconfirm>
          </>
        )}
      </div>
    </div>
  );
}
