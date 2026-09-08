"use client";

import { Card, Col, Row, Skeleton } from "antd";

/**
 * Skeleton loading (loading-toast-feedback-style) — PHẲNG, không tilt/washi
 * tape/hard-shadow (những chi tiết đó chỉ dành cho thẻ tin thật). Tách theo
 * đúng từng vùng thật của `ListingCard` (ảnh bìa 16:9, tag khu vực dạng
 * pill, dòng giá + ngày cần pass, mô tả 2 dòng, dòng thời gian đăng) thay vì
 * gộp thành 1 khối xám — để người dùng nhận ra ngay "đây sắp là 1 thẻ tin",
 * và để không có layout shift khi dữ liệu thật thay vào (cùng vị trí lưới
 * `xs=24 sm=12 lg=8` với `ListingGridView`).
 */
export function ListingCardSkeletonItem() {
  return (
    <Card variant="borderless" className="board-panel" styles={{ body: { padding: 0 } }}>
      <Skeleton.Image active style={{ width: "100%", height: "auto", aspectRatio: "16/9" }} />
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Tag khu vực — pill nhỏ, không phải dòng full-width */}
        <Skeleton.Button active size="small" shape="round" style={{ width: 96, minWidth: 96 }} />

        {/* Dòng giá + ngày cần pass */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <Skeleton.Button active size="small" style={{ width: 92, minWidth: 92 }} />
          <Skeleton.Button active size="small" style={{ width: 120, minWidth: 120 }} />
        </div>

        {/* Mô tả 2 dòng */}
        <Skeleton active title={false} paragraph={{ rows: 2, width: ["100%", "70%"] }} style={{ marginTop: 12 }} />

        {/* Dòng thời gian đăng */}
        <Skeleton.Button active size="small" style={{ width: 80, minWidth: 80, marginTop: 4 }} />
      </div>
    </Card>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} xs={24} sm={12} lg={8}>
          <ListingCardSkeletonItem />
        </Col>
      ))}
    </Row>
  );
}

/**
 * Skeleton cho trang chi tiết tin (`/tin/[id]`) — mirror đúng layout 2 cột
 * của `ListingDetailView` (ảnh lớn bên trái + thẻ thông tin bên phải), KHÔNG
 * dùng `ListingGridSkeleton` cho trang này dù cùng nằm trong route group
 * `(public)` — hình dạng 2 thứ hoàn toàn khác nhau (xem loading.tsx riêng).
 */
export function ListingDetailSkeleton() {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={14}>
        <Skeleton.Image active style={{ width: "100%", height: "auto", aspectRatio: "16/9" }} />
      </Col>
      <Col xs={24} md={10}>
        <Card variant="borderless" className="board-panel" styles={{ body: { padding: 24 } }}>
          <Skeleton.Button active size="small" shape="round" style={{ width: 96, minWidth: 96 }} />
          <div style={{ marginTop: 14 }}>
            <Skeleton.Button active style={{ width: 160, minWidth: 160, height: 28 }} />
          </div>
          <Skeleton.Button active size="small" style={{ width: 220, minWidth: 220, marginTop: 12 }} />
          <Skeleton active title={false} paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
          <Skeleton.Button active size="small" style={{ width: 60, minWidth: 60, marginTop: 8 }} />
          <Skeleton.Button active style={{ width: "100%", height: 40, marginTop: 10 }} />
        </Card>
      </Col>
    </Row>
  );
}
