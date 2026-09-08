/**
 * Chấm điểm xếp hạng Bảng tin — hàm thuần, không I/O, dễ unit test riêng.
 * Tái dùng `haversineDistanceKm` (không viết lại logic khoảng cách), đúng
 * tinh thần "compose, không duplicate" đã áp dụng ở `searchNearby`.
 *
 * Đây KHÔNG phải machine learning / gợi ý hành vi — chỉ là công thức cộng
 * điểm tuyến tính, minh bạch, dựa hoàn toàn trên sở thích người dùng tự khai
 * báo (hệ thống hiện không lưu lịch sử xem/tương tác nào để học từ đó).
 */
import type { ListingWithDetails } from "@/domain/listings/types";
import { haversineDistanceKm } from "@/domain/shared/geo";
import type { FeedMatchReason, FeedPreferences } from "./types";

const WEIGHT_REGION = 30;
const WEIGHT_PROXIMITY = 25;
const WEIGHT_PRICE = 20;
const WEIGHT_TAGS = 30;
const WEIGHT_RECENCY = 15;
// Điểm độ mới giảm dần theo nửa chu kỳ 5 ngày — tin đăng hôm nay gần như
// full điểm, tin 5 ngày trước còn ~1/2, 10 ngày trước còn ~1/4...
const RECENCY_HALF_LIFE_DAYS = 5;

export interface ScoredListing {
  score: number;
  reasons: FeedMatchReason[];
  distanceKm?: number;
}

export function scoreListing(
  listing: ListingWithDetails,
  prefs: FeedPreferences,
  now: Date,
): ScoredListing {
  let score = 0;
  const reasons: FeedMatchReason[] = [];
  let distanceKm: number | undefined;

  if (prefs.regionIds.length > 0 && prefs.regionIds.includes(listing.regionId)) {
    score += WEIGHT_REGION;
    reasons.push("region");
  }

  if (
    prefs.lat != null &&
    prefs.lng != null &&
    prefs.radiusKm != null &&
    listing.lat != null &&
    listing.lng != null
  ) {
    const dist = haversineDistanceKm({ lat: prefs.lat, lng: prefs.lng }, { lat: listing.lat, lng: listing.lng });
    if (dist <= prefs.radiusKm) {
      distanceKm = dist;
      score += WEIGHT_PROXIMITY * (1 - dist / prefs.radiusKm);
      reasons.push("proximity");
    }
  }

  if (prefs.priceMin != null || prefs.priceMax != null) {
    const min = prefs.priceMin ?? 0;
    const max = prefs.priceMax ?? Number.POSITIVE_INFINITY;
    if (listing.price >= min && listing.price <= max) {
      score += WEIGHT_PRICE;
      reasons.push("price");
    }
  }

  if (prefs.tagIds.length > 0) {
    const listingTagIds = new Set(listing.tags.map((t) => t.id));
    const overlap = prefs.tagIds.filter((id) => listingTagIds.has(id)).length;
    if (overlap > 0) {
      score += WEIGHT_TAGS * (overlap / prefs.tagIds.length);
      reasons.push("tags");
    }
  }

  const ageDays = (now.getTime() - new Date(listing.createdAt).getTime()) / 86_400_000;
  score += WEIGHT_RECENCY * Math.exp(-ageDays / RECENCY_HALF_LIFE_DAYS);
  if (ageDays < 1) reasons.push("new");

  return { score, reasons, distanceKm };
}
