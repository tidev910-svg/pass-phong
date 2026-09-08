"use client";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Col, Row } from "antd";
import { ListingCard, type ListingCardViewModel } from "./ListingCard";

export function ListingGridView({
  items,
  emptyDescription = "Thử nới rộng bộ lọc khu vực, giá hoặc ngày cần pass.",
}: {
  items: ListingCardViewModel[];
  /** Tuỳ biến theo ngữ cảnh gọi — vd chế độ "Tìm theo nhu cầu" gợi ý tăng
   * bán kính/đổi vị trí thay vì "khu vực" (không áp dụng ở chế độ đó). */
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title="Chưa có tin nào khớp" description={emptyDescription} />;
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.id} xs={24} sm={12} lg={8}>
          <ListingCard item={item} />
        </Col>
      ))}
    </Row>
  );
}
