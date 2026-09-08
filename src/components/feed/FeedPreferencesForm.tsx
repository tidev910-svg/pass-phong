"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Slider, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import type { Region } from "@/domain/regions/types";
import type { ListingTag } from "@/domain/listing-tags/types";
import type { FeedPreferences } from "@/domain/feed/types";
import { MIN_RADIUS_KM, MAX_RADIUS_KM } from "@/domain/listings/validation";
import { RegionMultiTagSelect } from "@/components/search/RegionMultiTagSelect";
import { PriceRangeSlider, MAX_PRICE } from "@/components/search/PriceRangeSlider";
import { TagPicker } from "@/components/listings/TagPicker";
import { LocationPicker, type LatLng } from "@/components/map/LocationPicker";
import { useToast } from "@/components/feedback/useToast";
import { saveFeedPreferencesAction } from "@/app/(account)/bang-tin/thiet-lap/actions";

const DEFAULT_RADIUS_KM = 3;

/**
 * Form thiết lập/sửa sở thích Bảng tin — dùng chung cho lần thiết lập đầu
 * tiên (`mode="setup"`, `/bang-tin/thiet-lap`, bắt buộc trước khi vào
 * `/bang-tin`) và sửa lại sau này (`mode="edit"`, tab "Sở thích Bảng tin" ở
 * `/tai-khoan`). Không dùng antd `Form` (khác `AccountSettingsForm`) vì phần
 * lớn field ở đây không phải input chuẩn (chọn nhiều khu vực, bản đồ, slider
 * bán kính/giá, tag nhiều nhóm) — quản lý state thủ công + 1 nút submit, cùng
 * cách `NearbySearchFields` đang xử lý vị trí+bán kính+giá.
 */
export function FeedPreferencesForm({
  regions,
  tags,
  initialPreferences,
  mode,
}: {
  regions: Region[];
  tags: ListingTag[];
  initialPreferences?: FeedPreferences | null;
  mode: "setup" | "edit";
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [regionIds, setRegionIds] = useState<number[]>(initialPreferences?.regionIds ?? []);
  const [tagIds, setTagIds] = useState<number[]>(initialPreferences?.tagIds ?? []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialPreferences?.priceMin ?? 0,
    initialPreferences?.priceMax ?? MAX_PRICE,
  ]);
  const [location, setLocation] = useState<LatLng | null>(
    initialPreferences?.lat != null && initialPreferences?.lng != null
      ? { lat: initialPreferences.lat, lng: initialPreferences.lng }
      : null,
  );
  const [radiusKm, setRadiusKm] = useState(initialPreferences?.radiusKm ?? DEFAULT_RADIUS_KM);
  const [isLocating, setIsLocating] = useState(false);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ lấy vị trí hiện tại — vui lòng chọn trực tiếp trên bản đồ.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        toast.error("Không lấy được vị trí hiện tại — vui lòng chọn trực tiếp trên bản đồ.");
        setIsLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  function handleSubmit() {
    if (regionIds.length === 0 && !location) {
      toast.error("Vui lòng chọn ít nhất 1 khu vực hoặc 1 vị trí trên bản đồ.");
      return;
    }
    if (tagIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sở thích (loại phòng/tiện ích).");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      for (const id of regionIds) formData.append("regionIds", String(id));
      for (const id of tagIds) formData.append("tagIds", String(id));
      // priceMax = MAX_PRICE nghĩa là "không giới hạn" (không gửi lên) — cùng
      // convention `priceMax < MAX_PRICE ? priceMax : undefined` đã dùng ở
      // `SearchFilterBar`/`MapSearchView`/`HomeSearchSection`.
      if (priceRange[0] > 0) formData.set("priceMin", String(priceRange[0]));
      if (priceRange[1] < MAX_PRICE) formData.set("priceMax", String(priceRange[1]));
      if (location) {
        formData.set("lat", String(location.lat));
        formData.set("lng", String(location.lng));
        formData.set("radiusKm", String(radiusKm));
      }

      const result = await saveFeedPreferencesAction(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (mode === "setup") {
        router.push("/bang-tin");
        return;
      }
      toast.success("Đã lưu sở thích Bảng tin.");
    });
  }

  return (
    <Card variant="borderless" className="board-panel" style={{ maxWidth: 640, margin: mode === "setup" ? "0 auto" : undefined }} styles={{ body: { padding: 24 } }}>
      {mode === "setup" && (
        <>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            Thiết lập Bảng tin
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Cho biết bạn đang tìm phòng như thế nào — Bảng tin sẽ ưu tiên hiển thị tin khớp nhất với lựa chọn dưới đây.
          </Typography.Paragraph>
        </>
      )}

      <div style={{ marginBottom: 20 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Khu vực quan tâm
        </Typography.Text>
        <RegionMultiTagSelect regions={regions} value={regionIds} onChange={setRegionIds} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Hoặc chọn vị trí trung tâm + bán kính (không bắt buộc)
        </Typography.Text>
        <Button
          icon={<EnvironmentOutlined />}
          onClick={handleUseCurrentLocation}
          loading={isLocating}
          size="small"
          style={{ marginBottom: 8 }}
        >
          Dùng vị trí hiện tại của tôi
        </Button>
        <LocationPicker value={location} onChange={setLocation} />
        {location && (
          <div style={{ maxWidth: 420, marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>Bán kính: {radiusKm}km</div>
            <Slider
              min={MIN_RADIUS_KM}
              max={MAX_RADIUS_KM}
              step={0.5}
              value={radiusKm}
              onChange={setRadiusKm}
              tooltip={{ formatter: (value) => `${value}km` }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Khoảng giá
        </Typography.Text>
        <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Sở thích (loại phòng & tiện ích)
        </Typography.Text>
        <TagPicker tags={tags} value={tagIds} onChange={setTagIds} />
      </div>

      <Button type="primary" block={mode === "setup"} onClick={handleSubmit} loading={isPending}>
        {mode === "setup" ? "Xem Bảng tin" : "Lưu thay đổi"}
      </Button>
    </Card>
  );
}
