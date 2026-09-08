import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedSearchRepository } from "@/domain/saved-searches/repository";
import type { SavedSearch } from "@/domain/saved-searches/types";

interface SavedSearchRow {
  id: string;
  user_id: string;
  region_id: number | null;
  price_min: number | null;
  price_max: number | null;
  move_out_date_from: string | null;
  move_out_date_to: string | null;
  last_viewed_at: string;
  created_at: string;
}

function toSavedSearch(row: SavedSearchRow): SavedSearch {
  return {
    id: row.id,
    userId: row.user_id,
    regionId: row.region_id,
    priceMin: row.price_min,
    priceMax: row.price_max,
    moveOutDateFrom: row.move_out_date_from,
    moveOutDateTo: row.move_out_date_to,
    lastViewedAt: row.last_viewed_at,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, user_id, region_id, price_min, price_max, move_out_date_from, move_out_date_to, last_viewed_at, created_at";

export function createSupabaseSavedSearchRepository(client: SupabaseClient): SavedSearchRepository {
  return {
    async create(userId, input) {
      const { data, error } = await client
        .from("saved_searches")
        .insert({
          user_id: userId,
          region_id: input.regionId ?? null,
          price_min: input.priceMin ?? null,
          price_max: input.priceMax ?? null,
          move_out_date_from: input.moveOutDateFrom ?? null,
          move_out_date_to: input.moveOutDateTo ?? null,
        })
        .select(SELECT_COLUMNS)
        .single();
      if (error) throw error;
      return toSavedSearch(data);
    },

    async listByUser(userId) {
      const { data, error } = await client
        .from("saved_searches")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toSavedSearch);
    },

    async findById(id) {
      const { data, error } = await client
        .from("saved_searches")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toSavedSearch(data) : null;
    },

    async countByUser(userId) {
      const { count, error } = await client
        .from("saved_searches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (error) throw error;
      return count ?? 0;
    },

    async touchLastViewed(id) {
      const { error } = await client
        .from("saved_searches")
        .update({ last_viewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },

    async delete(id) {
      const { error } = await client.from("saved_searches").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
