"use client";

import { PhoneOutlined, LinkOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";

export function ContactBadge({
  phone,
  link,
}: {
  phone: string | null;
  link: string | null;
}) {
  return (
    <Space orientation="vertical" size={8}>
      {phone && (
        <Typography.Link href={`tel:${phone}`} style={{ fontSize: 16 }}>
          <PhoneOutlined /> {phone}
        </Typography.Link>
      )}
      {link && (
        <Typography.Link href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 16 }}>
          <LinkOutlined /> {link}
        </Typography.Link>
      )}
    </Space>
  );
}
