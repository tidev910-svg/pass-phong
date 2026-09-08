"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button, Card, Form, Input, Typography } from "antd";
import { loginAction } from "./actions";
import { useToast } from "@/components/feedback/useToast";
import { TapeLabel } from "@/components/decor/TapeLabel";

export function LoginForm() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  function handleFinish(values: { username: string; password: string }) {
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result?.ok) {
        toast.error(result?.error ?? "Có lỗi xảy ra, thử lại nhé.");
      }
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -16, left: 24, zIndex: 1 }}>
        <TapeLabel>chào bạn!</TapeLabel>
      </div>
      <Card variant="borderless" className="board-panel auth-card" styles={{ body: { padding: 24 } }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Đăng nhập
        </Typography.Title>
        <Form layout="vertical" onFinish={handleFinish} disabled={isPending}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập." }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu." }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isPending}
            style={{ fontFamily: "var(--font-baloo-2), 'Segoe UI', sans-serif", fontWeight: 700 }}
          >
            Đăng nhập
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0, textAlign: "center", color: "var(--ink-soft)" }}>
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" style={{ color: "var(--forest)", fontWeight: 700 }}>
            Đăng ký
          </Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
