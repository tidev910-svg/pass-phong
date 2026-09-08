import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedPreferencesRepository } from "@/domain/feed/repository";
import type { FeedPreferences } from "@/domain/feed/types";

interface FeedPreferencesRow {
  user_id: string;
  price_min: number | null;
  price_max: number | null;
  lat: number | null;
  lng: number | null;
  radius_km: number | null;
  updated_at: string;
}

const BASE_SELECT = "user_id, price_min, price_max, lat, lng, radius_km, updated_at";

function toFeedPreferences(row: FeedPreferencesRow, regionIds: number[], tagIds: number[]): FeedPreferences {
  return {
    userId: row.user_id,
    regionIds,
    tagIds,
    priceMin: row.price_min === null ? null : Number(row.price_min),
    priceMax: row.price_max === null ? null : Number(row.price_max),
    lat: row.lat,
    lng: row.lng,
    radiusKm: row.radius_km === null ? null : Number(row.radius_km),
    updatedAt: row.updated_at,
  };
}

export function createSupabaseFeedPreferencesRepository(client: SupabaseClient): FeedPreferencesRepository {
  return {
    async findByUser(userId) {
      const { data: baseRow, error: baseError } = await client
        .from("feed_preferences")
        .select(BASE_SELECT)
        .eq("user_id", userId)
        .maybeSingle();
      if (baseError) throw baseError;
      if (!baseRow) return null;

      const [regionsResult, tagsResult] = await Promise.all([
        client.from("feed_preference_regions").select("region_id").eq("user_id", userId),
        client.from("feed_preference_tags").select("tag_id").eq("user_id", userId),
      ]);
      if (regionsResult.error) throw regionsResult.error;
      if (tagsResult.error) throw tagsResult.error;

      const regionIds = (regionsResult.data ?? []).map((row) => row.region_id as number);
      const tagIds = (tagsResult.data ?? []).map((row) => row.tag_id as number);
      return toFeedPreferences(baseRow, regionIds, tagIds);
    },

    // Không transactional (3 lệnh Supabase tuần tự) — cùng tiền lệ
    // `attachImages` sau `create`. Khác listing (tạo 1 lần), đây là bản ghi
    // sửa nhiều lần nên lỗi giữa chừng có thể để lại trạng thái không nhất
    // quán tới lần lưu kế tiếp — chấp nhận được cho MVP, xem Rủi ro trong plan.
    async upsert(userId, input) {
      const { data: baseRow, error: upsertError } = await client
        .from("feed_preferences")
        .upsert(
          {
            user_id: userId,
            price_min: input.priceMin ?? null,
            price_max: input.priceMax ?? null,
            lat: input.lat ?? null,
            lng: input.lng ?? null,
            radius_km: input.radiusKm ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select(BASE_SELECT)
        .single();
      if (upsertError) throw upsertError;

      const { error: deleteRegionsError } = await client
        .from("feed_preference_regions")
        .delete()
        .eq("user_id", userId);
      if (deleteRegionsError) throw deleteRegionsError;
      if (input.regionIds.length > 0) {
        const { error: insertRegionsError } = await client
          .from("feed_preference_regions")
          .insert(input.regionIds.map((regionId) => ({ user_id: userId, region_id: regionId })));
        if (insertRegionsError) throw insertRegionsError;
      }

      const { error: deleteTagsError } = await client.from("feed_preference_tags").delete().eq("user_id", userId);
      if (deleteTagsError) throw deleteTagsError;
      if (input.tagIds.length > 0) {
        const { error: insertTagsError } = await client
          .from("feed_preference_tags")
          .insert(input.tagIds.map((tagId) => ({ user_id: userId, tag_id: tagId })));
        if (insertTagsError) throw insertTagsError;
      }

      return toFeedPreferences(baseRow, input.regionIds, input.tagIds);
    },
  };
}
