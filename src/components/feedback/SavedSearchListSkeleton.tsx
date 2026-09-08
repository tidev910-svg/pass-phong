"use client";

import { Card, Skeleton, Space } from "antd";

/** Skeleton cho `/tim-kiem-da-luu` — mirror từng dòng thật của `SavedSearchListView`. */
export function SavedSearchListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} variant="borderless" className="board-panel" styles={{ body: { padding: 16 } }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <Skeleton.Button active style={{ width: 220, height: 20 }} />
            <Skeleton.Button active style={{ width: 60, height: 28 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Skeleton.Avatar active shape="square" size={76} style={{ borderRadius: 10 }} />
            <Skeleton.Avatar active shape="square" size={76} style={{ borderRadius: 10 }} />
            <Skeleton.Avatar active shape="square" size={76} style={{ borderRadius: 10 }} />
          </div>
          <Skeleton.Button active style={{ width: 160, height: 20, marginTop: 12 }} />
        </Card>
      ))}
    </Space>
  );
}
