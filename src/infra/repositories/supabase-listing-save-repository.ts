import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingSaveRepository } from "@/domain/listing-saves/repository";

export function createSupabaseListingSaveRepository(client: SupabaseClient): ListingSaveRepository {
  return {
    async create(userId, listingId) {
      // `ignoreDuplicates` — bấm lưu tin đã lưu rồi không lỗi (khoá chính
      // trùng), cùng tinh thần "idempotent" đã ghi ở interface.
      const { error } = await client
        .from("listing_saves")
        .upsert({ user_id: userId, listing_id: listingId }, { onConflict: "user_id,listing_id", ignoreDuplicates: true });
      if (error) throw error;
    },

    async delete(userId, listingId) {
      const { error } = await client
        .from("listing_saves")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      if (error) throw error;
    },

    async isSaved(userId, listingId) {
      const { data, error } = await client
        .from("listing_saves")
        .select("user_id")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .maybeSingle();
      if (error) throw error;
      return data !== null;
    },

    async listListingIdsByUser(userId) {
      const { data, error } = await client
        .from("listing_saves")
        .select("listing_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => row.listing_id as string);
    },

    async countByListingIds(listingIds) {
      if (listingIds.length === 0) return {};
      const { data, error } = await client.from("listing_saves").select("listing_id").in("listing_id", listingIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        const id = row.listing_id as string;
        counts[id] = (counts[id] ?? 0) + 1;
      }
      return counts;
    },
  };
}
