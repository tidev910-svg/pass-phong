"use client";

import Link from "next/link";
import { Button, Tag, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { COLOR_FOREST, COLOR_FOREST_DARK } from "@/theme/tokens";
import { formatDistanceKm } from "@/domain/listings/format";
import { IconBadge } from "@/components/decor/IconBadge";
import { Price } from "@/components/listings/Price";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import type { FeedItemViewModel } from "./feedViewModel";
import styles from "./FeedPostCard.module.css";

/**
 * Thẻ tin ở Bảng tin (`/bang-tin`) — kiểu "bài đăng" Facebook: đầu bài có
 * avatar/khu vực/thời gian, phần thân (bấm vào xem chi tiết) là giá + mô tả
 * + ảnh full-width, cuối cùng là thanh hành động NGANG tách biệt hẳn khỏi
 * vùng bấm-để-xem-chi-tiết (Lưu tin | Xem chi tiết) — khác structurally với
 * `ListingCard` (thẻ ghim bulletin-board dùng ở mọi nơi khác trong app), chứ
 * không chỉ là 1 biến thể CSS. Xem ngoại lệ style đã ghi ở `UI_STYLE_GUIDE.md`.
 *
 * Thanh hành động đặt NGOÀI `<Link>` bọc phần thân (không lồng nút bấm vào
 * trong `<a>`) — vừa đúng chuẩn HTML, vừa khớp UX Facebook thật (bấm vào ảnh/
 * caption để xem, bấm nút hành động thì không điều hướng).
 */
export function FeedPostCard({ item }: { item: FeedItemViewModel }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <IconBadge
          size={38}
          radius={999}
          background={COLOR_FOREST}
          shadowColor="transparent"
          iconColor="#fff"
          rotateDeg={0}
          icon={<span className={styles.avatarLetter}>{item.regionName.charAt(0)}</span>}
        />
        <div className={styles.headerText}>
          <span className={styles.regionName}>{item.regionName}</span>
          <span className={styles.timestamp}>{item.createdAtLabel}</span>
        </div>
        {item.isPassed && (
          <Tag color="success" className={styles.passedBadge}>
            Đã pass
          </Tag>
        )}
      </div>

      <Link href={`/tin/${item.id}`} className={styles.bodyLink}>
        {item.matchLabel && <div className={styles.matchLabel}>{item.matchLabel}</div>}

        <div className={styles.priceRow}>
          <Price value={item.price} />
          <Typography.Text className={styles.moveOutText}>
            Cần pass trước {item.moveOutDateLabel}
          </Typography.Text>
        </div>

        {item.distanceKm !== undefined && (
          <Typography.Text className={styles.distanceText}>
            📍 Cách vị trí đã chọn {formatDistanceKm(item.distanceKm)}
          </Typography.Text>
        )}

        {item.description && (
          <Typography.Paragraph ellipsis={{ rows: 3 }} className={styles.description}>
            {item.description}
          </Typography.Paragraph>
        )}

        {item.tags.length > 0 && (
          <div className={styles.tagsRow}>
            {item.tags.map((tag) => (
              <Tag key={tag.id}>{tag.label}</Tag>
            ))}
          </div>
        )}

        {item.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImageUrl} alt={`Ảnh phòng ${item.regionName}`} className={styles.image} />
        )}
      </Link>

      <div className={styles.actionBar}>
        <SaveListingButton
          listingId={item.id}
          initialSaved={item.isSaved}
          initialCount={item.saveCount}
          isLoggedIn
        />
        <Link href={`/tin/${item.id}`}>
          <Button type="text" style={{ color: COLOR_FOREST_DARK }} icon={<RightOutlined />} iconPlacement="end">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </article>
  );
}
