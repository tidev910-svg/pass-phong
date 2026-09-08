"use client";

import { useState, useTransition } from "react";
import type { Dayjs } from "dayjs";
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { Region } from "@/domain/regions/types";
import type { ListingTag } from "@/domain/listing-tags/types";
import { dayjsToIsoDate, isoDateToDayjs } from "@/lib/format/date";
import { formatVndInput, parseVndInput } from "@/lib/format/currency";
import { createListingAction } from "@/app/(account)/dang-tin/actions";
import { updateListingAction } from "@/app/(account)/tin/[id]/sua/actions";
import { useToast } from "@/components/feedback/useToast";
import { LocationPicker, type LatLng } from "@/components/map/LocationPicker";
import { TagPicker } from "./TagPicker";

interface FormValues {
  regionId: number;
  price: number;
  moveOutDate: Dayjs;
  description?: string;
  contactPhone?: string;
  contactLink?: string;
  tagIds?: number[];
}

export interface ListingFormInitialValues {
  regionId?: number;
  price?: number;
  moveOutDate?: string; // ISO date
  description?: string;
  contactPhone?: string;
  contactLink?: string;
  /** Prefill vị trí đã chọn sẵn — từ tin gốc khi đăng lại, hoặc từ tin đang
   * sửa khi `mode="edit"`. */
  lat?: number;
  lng?: number;
  tagIds?: number[];
}

/**
 * Form đăng tin dùng chung cho cả 3 luồng: đăng tin mới (`/dang-tin`), sửa
 * tin (`/tin/[id]/sua`), và đăng lại tin đã pass (`/dang-tin?repostFrom=`,
 * cũng đi qua mode "create" — chỉ khác là có `initialValues` prefill sẵn).
 * Đặt ở `components/listings/` (không phải trong 1 route cụ thể) vì được
 * dùng bởi nhiều route khác nhau — tránh lặp toàn bộ UI form 2 lần.
 */
export function ListingForm({
  regions,
  tags,
  mode = "create",
  listingId,
  initialValues,
}: {
  regions: Region[];
  tags: ListingTag[];
  mode?: "create" | "edit";
  listingId?: string;
  initialValues?: ListingFormInitialValues;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [location, setLocation] = useState<LatLng | null>(
    initialValues?.lat !== undefined && initialValues?.lng !== undefined
      ? { lat: initialValues.lat, lng: initialValues.lng }
      : null,
  );

  function handleFinish(values: FormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("regionId", String(values.regionId));
      formData.set("price", String(values.price));
      formData.set("moveOutDate", dayjsToIsoDate(values.moveOutDate) ?? "");
      if (values.description) formData.set("description", values.description);
      if (values.contactPhone) formData.set("contactPhone", values.contactPhone);
      if (values.contactLink) formData.set("contactLink", values.contactLink);
      for (const tagId of values.tagIds ?? []) formData.append("tagIds", String(tagId));
      // Khi đang sửa tin và người dùng bấm "Xoá vị trí", cố ý KHÔNG gửi field
      // lat/lng (thay vì gửi rỗng) — `updateListingAction` hiểu "thiếu field"
      // là tín hiệu xoá vị trí đang có, xem comment ở đó.
      if (location) {
        formData.set("lat", String(location.lat));
        formData.set("lng", String(location.lng));
      }
      for (const file of fileList) {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      }

      const result =
        mode === "edit" && listingId
          ? await updateListingAction(listingId, formData)
          : await createListingAction(formData);

      if (!result?.ok) {
        toast.error(result?.error ?? "Có lỗi xảy ra, thử lại nhé.");
      }
      // Không có nhánh "thành công" ở đây: `createListingAction`/
      // `updateListingAction` redirect() ngay trong Server Action khi ok —
      // hàm không bao giờ trả về, nên toast thành công được bắn ở trang đích
      // (`/tin/[id]?posted=1|updated=1`) qua `ListingActionToast`, không phải
      // ở đây.
    });
  }

  const isEdit = mode === "edit";

  return (
    <Card
      variant="borderless"
      className="board-panel"
      style={{ maxWidth: 640, margin: "0 auto" }}
      styles={{ body: { padding: 24 } }}
    >
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {isEdit ? "Sửa tin đăng" : "Đăng tin pass phòng"}
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Bắt buộc để lại ít nhất một cách liên hệ (số điện thoại hoặc link Facebook/Instagram) thì tin
        mới được đăng.
      </Typography.Paragraph>

      <Form<FormValues>
        layout="vertical"
        onFinish={handleFinish}
        disabled={isPending}
        initialValues={
          initialValues && {
            regionId: initialValues.regionId,
            price: initialValues.price,
            moveOutDate: isoDateToDayjs(initialValues.moveOutDate ?? "") ?? undefined,
            description: initialValues.description,
            contactPhone: initialValues.contactPhone,
            contactLink: initialValues.contactLink,
            tagIds: initialValues.tagIds ?? [],
          }
        }
      >
        <Form.Item
          name="regionId"
          label="Khu vực"
          rules={[{ required: true, message: "Vui lòng chọn khu vực." }]}
        >
          <Select
            placeholder="Chọn khu vực"
            options={regions.map((r) => ({ label: r.name, value: r.id }))}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá (đ/tháng)"
          rules={[{ required: true, message: "Vui lòng nhập giá." }]}
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            min={0}
            step={100_000}
            formatter={(value) => formatVndInput(value)}
            parser={(value) => parseVndInput(value)}
            suffix="đ"
          />
        </Form.Item>

        <Form.Item
          name="moveOutDate"
          label="Ngày cần pass"
          rules={[{ required: true, message: "Vui lòng chọn ngày cần pass." }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} maxLength={2000} showCount placeholder="Diện tích, tiện ích, lý do pass..." />
        </Form.Item>

        <Form.Item name="tagIds" label="Loại phòng & tiện ích (không bắt buộc)">
          <TagPicker tags={tags} singleSelectCategories={["room_type"]} />
        </Form.Item>

        {/* Form.Item không bọc field antd thật (vị trí không phải giá trị Form
            quản lý, xem state `location` ở trên) — chỉ mượn layout label/spacing
            cho đồng bộ với các field khác. Hiện ở cả 2 luồng tạo/sửa tin. */}
        <Form.Item label="Vị trí trên bản đồ (không bắt buộc)">
          <LocationPicker value={location} onChange={setLocation} />
        </Form.Item>

        <Form.Item label={isEdit ? "Thêm ảnh phòng (không bắt buộc)" : "Ảnh phòng (không bắt buộc)"}>
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: next }) => setFileList(next)}
            multiple
            accept="image/*"
          >
            {fileList.length >= 6 ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="contactPhone"
          label="Số điện thoại"
          rules={[{ pattern: /^(0|\+84)[0-9]{9,10}$/, message: "Số điện thoại không hợp lệ." }]}
        >
          <Input placeholder="09xxxxxxxx" />
        </Form.Item>

        <Form.Item
          name="contactLink"
          label="Link Facebook/Instagram"
          rules={[{ type: "url", message: "Link không hợp lệ." }]}
        >
          <Input placeholder="https://facebook.com/..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={isPending}>
          {isEdit ? "Lưu thay đổi" : "Đăng tin"}
        </Button>
      </Form>
    </Card>
  );
}
