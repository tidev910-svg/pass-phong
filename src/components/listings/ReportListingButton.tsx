"use client";

import { useState, useTransition } from "react";
import { Button, Form, Input, Modal, Radio } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { reportListingAction } from "@/app/(public)/tin/[id]/actions";
import { useToast } from "@/components/feedback/useToast";
import { REPORT_REASONS } from "@/domain/reports/validation";

export function ReportListingButton({ listingId }: { listingId: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ reason: string; note?: string }>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(values: { reason: string; note?: string }) {
    startTransition(async () => {
      const result = await reportListingAction(listingId, values.reason, values.note);
      if (result.ok) {
        toast.success("Cảm ơn bạn đã báo cáo, chúng tôi sẽ kiểm tra sớm.");
        setOpen(false);
        form.resetFields();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button type="text" danger size="small" icon={<WarningOutlined />} onClick={() => setOpen(true)}>
        Báo cáo tin này
      </Button>
      <Modal
        title="Báo cáo tin đăng"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Gửi báo cáo"
        cancelText="Huỷ"
        confirmLoading={isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="reason"
            label="Lý do báo cáo"
            rules={[{ required: true, message: "Vui lòng chọn lý do." }]}
          >
            <Radio.Group options={REPORT_REASONS.map((r) => ({ label: r, value: r }))} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú thêm (không bắt buộc)">
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
