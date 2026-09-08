"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Card, Tag, Typography } from "antd";
import { COLOR_FOREST, getCardTiltDeg } from "@/theme/tokens";
import { formatDistanceKm } from "@/domain/listings/format";
import { Price } from "./Price";
import styles from "./ListingCard.module.css";

export interface ListingCardViewModel {
  id: string;
  regionName: string;
  price: number;
  moveOutDateLabel: string;
  createdAtLabel: string;
  description: string | null;
  isPassed: boolean;
  coverImageUrl: string | null;
  /** Khoảng cách tới điểm tìm kiếm — chỉ có giá trị ở kết quả "Tìm theo nhu
   * cầu" (vị trí + bán kính), `undefined` ở mọi nơi khác dùng chung view-model
   * này (lưới trang chủ theo khu vực, trang hồ sơ...). */
  distanceKm?: number;
  /** Loại phòng/tiện ích đã gắn — rỗng/`undefined` nếu tin không có tag. */
  tags?: { id: number; label: string }[];
}

/**
 * Thẻ tin đăng — "tờ giấy ghim trên bảng tin" (Dorm Bulletin Board): nghiêng
 * nhẹ deterministic theo id (không đổi giữa các lần render), có washi tape
 * ghim ở mép trên. Dùng ở mọi nơi liệt kê tin theo lưới nhiều cột (trang chủ,
 * hồ sơ, kết quả tìm kiếm đã lưu...). Component thuần client — không gọi hạ
 * tầng, chỉ render từ view-model đã resolve sẵn ở server.
 *
 * Bảng tin cá nhân hoá (`/bang-tin`) KHÔNG dùng component này — trang đó có
 * `FeedPostCard` riêng (kiểu Facebook, xem `UI_STYLE_GUIDE.md`), vì cấu trúc
 * DOM khác hẳn (feed 1 cột, thanh hành động tách rời link, có nút "Lưu tin")
 * chứ không chỉ khác CSS.
 */
export function ListingCard({
  item,
  mutedPrice = false,
}: {
  item: ListingCardViewModel;
  /** Tin đã pass ở trang hồ sơ — giảm độ nổi bật của giá (xem Price.tsx). */
  mutedPrice?: boolean;
}) {
  const tiltStyle = { "--tilt": `${getCardTiltDeg(item.id)}deg` } as CSSProperties;

  return (
    <div className={styles.cardWrap}>
      <div className={styles.washiTape} aria-hidden />
      <Link href={`/tin/${item.id}`} className={styles.cardLink}>
        <Card
          variant="borderless"
          className={styles.pinnedCard}
          style={tiltStyle}
          styles={{ body: { padding: 0 } }}
        >
          <div className={styles.imageWrap}>
            {item.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.coverImageUrl} alt={`Ảnh phòng ${item.regionName}`} className={styles.image} />
            ) : (
              <div className={styles.placeholder}>{item.regionName}</div>
            )}
            {item.isPassed && (
              <Tag color="success" className={styles.passedBadge}>
                Đã pass thành công
              </Tag>
            )}
          </div>

          <div className={styles.body}>
            <Tag color={COLOR_FOREST}>{item.regionName}</Tag>
            {item.tags && item.tags.length > 0 && (
              <span style={{ marginLeft: 4 }}>
                {item.tags.map((tag) => (
                  <Tag key={tag.id} style={{ marginBottom: 4 }}>
                    {tag.label}
                  </Tag>
                ))}
              </span>
            )}
            {item.distanceKm !== undefined && (
              <Typography.Text style={{ display: "block", fontSize: 12, color: "var(--forest-dark)", fontWeight: 600, marginTop: 4 }}>
                📍 Cách vị trí đã chọn {formatDistanceKm(item.distanceKm)}
              </Typography.Text>
            )}
            <div className={styles.metaRow}>
              <Price value={item.price} muted={mutedPrice} />
              <Typography.Text style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Cần pass trước {item.moveOutDateLabel}
              </Typography.Text>
            </div>
            {item.description && (
              <Typography.Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginTop: 8, marginBottom: 0, color: "var(--ink)" }}
              >
                {item.description}
              </Typography.Paragraph>
            )}
            <Typography.Text style={{ fontSize: 12, color: "var(--ink-soft)" }}>
              {item.createdAtLabel}
            </Typography.Text>
          </div>
        </Card>
      </Link>
    </div>
  );
}
