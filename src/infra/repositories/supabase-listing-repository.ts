import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingRepository } from "@/domain/listings/repository";
import type {
  Listing,
  ListingImage,
  ListingSearchFilter,
  ListingStatus,
  ListingWithDetails,
  ListingWithDistance,
  NearbySearchFilter,
  SearchResult,
} from "@/domain/listings/types";
import { boundingBoxForRadius, haversineDistanceKm } from "@/domain/shared/geo";
import { toRegion, type RegionRow } from "./supabase-region-repository";
import { toListingTag, type ListingTagRow } from "./supabase-listing-tag-repository";

interface ListingRow {
  id: string;
  user_id: string;
  region_id: number;
  price: number;
  move_out_date: string;
  description: string | null;
  contact_phone: string | null;
  contact_link: string | null;
  status: ListingStatus;
  passed_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  lat: number | null;
  lng: number | null;
}

interface ListingImageRow {
  id: string;
  storage_path: string;
  display_order: number;
}

interface ListingTagLinkRow {
  tag: ListingTagRow | null;
}

interface ListingRowWithJoins extends ListingRow {
  region: RegionRow;
  images: ListingImageRow[] | null;
  tags: ListingTagLinkRow[] | null;
}

const BASE_SELECT =
  "id, user_id, region_id, price, move_out_date, description, contact_phone, contact_link, status, passed_confirmed_at, created_at, updated_at, lat, lng";
const DETAIL_SELECT = `${BASE_SELECT}, region:regions(*), images:listing_images(id, storage_path, display_order), tags:listing_tag_links(tag:listing_tags(*))`;

function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    userId: row.user_id,
    regionId: row.region_id,
    price: Number(row.price),
    moveOutDate: row.move_out_date,
    description: row.description,
    contactPhone: row.contact_phone,
    contactLink: row.contact_link,
    status: row.status,
    passedConfirmedAt: row.passed_confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
  };
}

function toListingImage(row: ListingImageRow): ListingImage {
  return { id: row.id, storagePath: row.storage_path, displayOrder: row.display_order };
}

function toListingWithDetails(row: ListingRowWithJoins): ListingWithDetails {
  return {
    ...toListing(row),
    region: toRegion(row.region),
    images: (row.images ?? [])
      .map(toListingImage)
      .sort((a, b) => a.displayOrder - b.displayOrder),
    tags: (row.tags ?? [])
      .map((link) => link.tag)
      .filter((tag): tag is ListingTagRow => tag !== null)
      .map(toListingTag)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

/**
 * Áp filter dùng chung cho `search` và `countMatchingCreatedAfter` (badge saved
 * search phải dùng đúng cùng 1 bộ điều kiện lọc với tìm kiếm chính).
 * Kiểu `any` ở đây vì kiểu chain thực của PostgrestFilterBuilder rất khó khái
 * quát hoá qua generic — hàm chỉ dùng nội bộ file này nên chấp nhận được.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySearchFilters(query: any, filter: ListingSearchFilter) {
  let q = query;
  if (filter.regionId !== undefined) q = q.eq("region_id", filter.regionId);
  if (filter.priceMin !== undefined) q = q.gte("price", filter.priceMin);
  if (filter.priceMax !== undefined) q = q.lte("price", filter.priceMax);
  if (filter.moveOutDateFrom !== undefined) q = q.gte("move_out_date", filter.moveOutDateFrom);
  if (filter.moveOutDateTo !== undefined) q = q.lte("move_out_date", filter.moveOutDateTo);
  return q;
}

const DEFAULT_PAGE_SIZE = 20;

// Số ứng viên tối đa lấy về trước khi lọc Haversine chính xác — bounding box
// đã thu hẹp phần lớn, hằng số này chỉ chặn trường hợp cực đoan (bán kính
// lớn + mật độ tin cao). Đủ dùng ở quy mô hiện tại, cùng tinh thần với
// `MAP_PAGE_SIZE` ở trang `/tim-tin/ban-do`.
const NEARBY_CANDIDATE_LIMIT = 300;

export function createSupabaseListingRepository(client: SupabaseClient): ListingRepository {
  return {
    async create(userId, input) {
      const { data, error } = await client
        .from("listings")
        .insert({
          user_id: userId,
          region_id: input.regionId,
          price: input.price,
          move_out_date: input.moveOutDate,
          description: input.description ?? null,
          contact_phone: input.contactPhone ?? null,
          contact_link: input.contactLink ?? null,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
        })
        .select(BASE_SELECT)
        .single();
      if (error) throw error;
      return toListing(data);
    },

    async update(id, input) {
      const patch: Record<string, unknown> = {};
      if (input.regionId !== undefined) patch.region_id = input.regionId;
      if (input.price !== undefined) patch.price = input.price;
      if (input.moveOutDate !== undefined) patch.move_out_date = input.moveOutDate;
      if (input.description !== undefined) patch.description = input.description ?? null;
      if (input.contactPhone !== undefined) patch.contact_phone = input.contactPhone ?? null;
      if (input.contactLink !== undefined) patch.contact_link = input.contactLink ?? null;
      // lat/lng: `!== undefined` cố ý giữ nguyên `null` (xoá vị trí) khác với
      // bỏ qua hoàn toàn — xem comment ở `CreateListingInput`/`ListingRepository.update`.
      if (input.lat !== undefined) patch.lat = input.lat;
      if (input.lng !== undefined) patch.lng = input.lng;
      patch.updated_at = new Date().toISOString();

      const { data, error } = await client.from("listings").update(patch).eq("id", id).select(BASE_SELECT).single();
      if (error) throw error;
      return toListing(data);
    },

    async attachImages(listingId, storagePaths) {
      const rows = storagePaths.map((storagePath, index) => ({
        listing_id: listingId,
        storage_path: storagePath,
        display_order: index,
      }));
      const { error } = await client.from("listing_images").insert(rows);
      if (error) throw error;
    },

    async findById(id) {
      const { data, error } = await client
        .from("listings")
        .select(DETAIL_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toListingWithDetails(data as unknown as ListingRowWithJoins) : null;
    },

    async findByIds(ids) {
      if (ids.length === 0) return [];
      const { data, error } = await client.from("listings").select(DETAIL_SELECT).in("id", ids);
      if (error) throw error;
      return (data ?? []).map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins));
    },

    async search(filter) {
      const page = filter.page ?? 1;
      const pageSize = filter.pageSize ?? DEFAULT_PAGE_SIZE;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = client
        .from("listings")
        .select(DETAIL_SELECT, { count: "exact" })
        .eq("status", "active");
      query = applySearchFilters(query, filter);
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;

      return {
        items: (data ?? []).map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins)),
        total: count ?? 0,
        page,
        pageSize,
      } satisfies SearchResult<ListingWithDetails>;
    },

    // Chế độ "Tìm theo nhu cầu" (vị trí + bán kính) — TÁCH RIÊNG khỏi
    // `search()`/`applySearchFilters` ở trên (khu vực), vì đây là 1 kiểu
    // truy vấn hoàn toàn khác: không có PostGIS nên không thể lọc chính xác
    // hình tròn bằng query builder. Chiến lược: lọc thô bằng bounding box
    // (gte/lte lat/lng, dùng index thường), rồi lọc chính xác + sort theo
    // khoảng cách bằng Haversine ở tầng app.
    async searchNearby(filter: NearbySearchFilter): Promise<ListingWithDistance[]> {
      const center = { lat: filter.lat, lng: filter.lng };
      const box = boundingBoxForRadius(center, filter.radiusKm);

      let query = client
        .from("listings")
        .select(DETAIL_SELECT)
        .eq("status", "active")
        .not("lat", "is", null)
        .not("lng", "is", null)
        .gte("lat", box.latMin)
        .lte("lat", box.latMax)
        .gte("lng", box.lngMin)
        .lte("lng", box.lngMax);
      if (filter.priceMin !== undefined) query = query.gte("price", filter.priceMin);
      if (filter.priceMax !== undefined) query = query.lte("price", filter.priceMax);

      const { data, error } = await query.limit(NEARBY_CANDIDATE_LIMIT);
      if (error) throw error;

      return (data ?? [])
        .map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins))
        .map((listing) => ({
          // Non-null assertion an toàn: query đã lọc `.not("lat"/"lng","is",null)`.
          ...listing,
          distanceKm: haversineDistanceKm(center, { lat: listing.lat!, lng: listing.lng! }),
        }))
        .filter((listing) => listing.distanceKm <= filter.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    },

    async listByUser(userId) {
      const { data, error } = await client
        .from("listings")
        .select(DETAIL_SELECT)
        .eq("user_id", userId)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins));
    },

    async countByUserStatus(userId) {
      const [activeResult, passedResult] = await Promise.all([
        client.from("listings").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
        client.from("listings").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "passed"),
      ]);
      if (activeResult.error) throw activeResult.error;
      if (passedResult.error) throw passedResult.error;
      return { active: activeResult.count ?? 0, passed: passedResult.count ?? 0 };
    },

    async countMatchingCreatedAfter(filter, since) {
      let query = client
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("created_at", since);
      query = applySearchFilters(query, filter);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },

    async softDelete(id) {
      const { error } = await client.from("listings").update({ status: "deleted" }).eq("id", id);
      if (error) throw error;
    },

    async markPassed(id) {
      const { error } = await client
        .from("listings")
        .update({ status: "passed", passed_confirmed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },

    async adminListAll(filter) {
      let query = client.from("listings").select(DETAIL_SELECT);
      if (filter?.status) query = query.eq("status", filter.status);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins));
    },

    async setListingTags(listingId, tagIds) {
      const { error: deleteError } = await client.from("listing_tag_links").delete().eq("listing_id", listingId);
      if (deleteError) throw deleteError;
      if (tagIds.length === 0) return;

      const rows = tagIds.map((tagId) => ({ listing_id: listingId, tag_id: tagId }));
      const { error: insertError } = await client.from("listing_tag_links").insert(rows);
      if (insertError) throw insertError;
    },

    // Candidate pool cho Bảng tin — lấy theo độ mới trước, chấm điểm/phân
    // trang ở tầng domain (`src/domain/feed/service.ts`). Cùng tinh thần
    // "fetch candidate pool rồi lọc/sort ở app" như `searchNearby` — không
    // đếm total, không filter, chỉ cắt theo `limit`.
    async listActiveForFeed(limit) {
      const { data, error } = await client
        .from("listings")
        .select(DETAIL_SELECT)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => toListingWithDetails(row as unknown as ListingRowWithJoins));
    },
  };
}
