"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import type { ReactNode } from "react";
import { themeConfig } from "@/theme/theme-config";

/**
 * Bọc ConfigProvider (theme teal + bo góc theo UI_STYLE_GUIDE) trong
 * AntdRegistry để SSR đúng cách trong App Router (cách antd chính thức
 * khuyến nghị, tránh flash-of-unstyled-content).
 * `App` của antd cung cấp context cho `message`/`notification`/`Modal` dùng
 * qua hook (`App.useApp()`) thay vì static method — cần cho App Router.
 */
export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
