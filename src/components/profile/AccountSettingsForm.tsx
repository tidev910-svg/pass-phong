"use client";

import { useTransition } from "react";
import { Button, Card, Form, Input } from "antd";
import { updateAccountAction } from "@/app/(account)/tai-khoan/actions";
import { useToast } from "@/components/feedback/useToast";

interface FormValues {
  displayName?: string;
  phoneOrZalo?: string;
  newPassword?: string;
}

/**
 * Nút "Lưu thay đổi" dùng nguyên `type="primary"` mặc định (forest bg + hard
 * shadow đã cấu hình toàn site qua `.ant-btn-primary` trong globals.css) —
 * KHÔNG đổi riêng sang font Baloo 2 cho nút này dù yêu cầu có nhắc, vì cùng
 * yêu cầu cũng nói "khớp style nút dùng ở nơi khác trong app" — mọi nút
 * primary khác (Đăng ký, Tìm phòng, Đăng tin...) đều dùng Be Vietnam Pro, để
 * riêng nút này Baloo 2 sẽ lệch chuẩn thay vì khớp.
 */
export function AccountSettingsForm({
  initialDisplayName,
  initialPhoneOrZalo,
}: {
  initialDisplayName: string;
  initialPhoneOrZalo: string;
}) {
  const toast = useToast();
  const [form] = Form.useForm<FormValues>();
  const [isPending, startTransition] = useTransition();

  function handleFinish(values: FormValues) {
    startTransition(async () => {
      const formData = new FormData();
      if (values.displayName) formData.set("displayName", values.displayName);
      if (values.phoneOrZalo) formData.set("phoneOrZalo", values.phoneOrZalo);
      if (values.newPassword) formData.set("newPassword", values.newPassword);

      const result = await updateAccountAction(formData);
      if (result.ok) {
        toast.success("Đã lưu thay đổi.");
        form.setFieldValue("newPassword", undefined);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card variant="borderless" className="board-panel" style={{ maxWidth: 480 }} styles={{ body: { padding: 24 } }}>
      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={isPending}
        initialValues={{
          displayName: initialDisplayName || undefined,
          phoneOrZalo: initialPhoneOrZalo || undefined,
        }}
      >
        <Form.Item name="displayName" label="Tên hiển thị">
          <Input placeholder="Tên hiển thị công khai" maxLength={60} />
        </Form.Item>

        <Form.Item name="phoneOrZalo" label="Số điện thoại / Zalo">
          <Input placeholder="09xxxxxxxx hoặc tên Zalo" maxLength={60} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          extra="Để trống nếu không muốn đổi mật khẩu."
          rules={[
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự." },
            { pattern: /[a-zA-Z]/, message: "Mật khẩu phải có ít nhất 1 chữ cái." },
            { pattern: /[0-9]/, message: "Mật khẩu phải có ít nhất 1 chữ số." },
          ]}
        >
          <Input.Password placeholder="Ít nhất 8 ký tự, có chữ và số" autoComplete="new-password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isPending}>
          Lưu thay đổi
        </Button>
      </Form>
    </Card>
  );
}
