"use client";

import { Empty, Typography } from "antd";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Empty
      style={{ padding: "48px 0" }}
      description={
        <>
          <Typography.Text strong>{title}</Typography.Text>
          {description && (
            <div>
              <Typography.Text type="secondary">{description}</Typography.Text>
            </div>
          )}
        </>
      }
    />
  );
}
