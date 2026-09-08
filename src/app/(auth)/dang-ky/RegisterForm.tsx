"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button, Card, Form, Input, Typography } from "antd";
import { registerAction } from "./actions";
import { useToast } from "@/components/feedback/useToast";
import { TapeLabel } from "@/components/decor/TapeLabel";

export function RegisterForm() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  function handleFinish(values: { username: string; password: string }) {
    startTransition(async () => {
      const result = await registerAction(values);
      if (!result?.ok) {
        toast.error(result?.error ?? "Có lỗi xảy ra, thử lại nhé.");
      }
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -16, left: 24, zIndex: 1 }}>
        <TapeLabel>tạo tài khoản nè!</TapeLabel>
      </div>
      <Card variant="borderless" className="board-panel auth-card" styles={{ body: { padding: 24 } }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Đăng ký
        </Typography.Title>
        <Form layout="vertical" onFinish={handleFinish} disabled={isPending}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập." }]}
          >
            <Input autoComplete="username" placeholder="vd: sinhvien_ct" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu." },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự." },
              { pattern: /[a-zA-Z]/, message: "Mật khẩu phải có ít nhất 1 chữ cái." },
              { pattern: /[0-9]/, message: "Mật khẩu phải có ít nhất 1 chữ số." },
            ]}
            extra={
              // Trấn an người dùng form ngắn là có chủ đích, không phải thiếu
              // trường — không phải field mới, chỉ là dòng chú thích.
              <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                Bạn có thể thêm số điện thoại/Zalo sau trong Cài đặt tài khoản.
              </span>
            }
          >
            <Input.Password autoComplete="new-password" placeholder="Ít nhất 8 ký tự, có chữ và số" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isPending}
            style={{ fontFamily: "var(--font-baloo-2), 'Segoe UI', sans-serif", fontWeight: 700 }}
          >
            Đăng ký
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0, textAlign: "center", color: "var(--ink-soft)" }}>
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" style={{ color: "var(--forest)", fontWeight: 700 }}>
            Đăng nhập
          </Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
