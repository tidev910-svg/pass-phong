/**
 * Tính toán hình học địa lý thuần TypeScript — không phụ thuộc Supabase/React,
 * dùng lại được ở bất kỳ tầng nào (domain/infra/UI). Viết từ đầu vì DB không
 * có PostGIS/extension geo nào (`lat`/`lng` chỉ là cột `double precision`
 * thường, xem `supabase/migrations/0004_listing_coordinates.sql`).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Khoảng cách đường chim bay giữa 2 toạ độ (km) — công thức Haversine. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Xấp xỉ chuẩn: 1 độ vĩ ~ 110.574km cố định; 1 độ kinh phụ thuộc vĩ độ
// (hẹp dần về 2 cực) ~ 111.320 * cos(lat) km. Đủ chính xác ở quy mô 1 thành
// phố như Cần Thơ.
const KM_PER_DEGREE_LAT = 110.574;
const KM_PER_DEGREE_LNG_AT_EQUATOR = 111.32;

/**
 * Hình chữ nhật (theo độ) bao quanh vòng tròn bán kính `radiusKm` quanh
 * `center` — dùng để lọc thô ở tầng query (Supabase `gte`/`lte` trên
 * lat/lng) trước khi lọc chính xác bằng `haversineDistanceKm`. Hình chữ
 * nhật này rộng hơn hình tròn thật (đặc biệt ở 4 góc), nên bắt buộc phải
 * lọc lại chính xác sau đó — đây chỉ là bước giảm số dòng cần fetch.
 */
export function boundingBoxForRadius(
  center: GeoPoint,
  radiusKm: number,
): { latMin: number; latMax: number; lngMin: number; lngMax: number } {
  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const kmPerDegreeLng = KM_PER_DEGREE_LNG_AT_EQUATOR * Math.cos(toRadians(center.lat));
  const lngDelta = radiusKm / kmPerDegreeLng;

  return {
    latMin: center.lat - latDelta,
    latMax: center.lat + latDelta,
    lngMin: center.lng - lngDelta,
    lngMax: center.lng + lngDelta,
  };
}
