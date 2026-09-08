import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingTagRepository } from "@/domain/listing-tags/repository";
import type { ListingTag, ListingTagCategory } from "@/domain/listing-tags/types";

export interface ListingTagRow {
  id: number;
  slug: string;
  label: string;
  category: ListingTagCategory;
  display_order: number;
}

/** Exported để `supabase-listing-repository.ts` tái dùng khi map tag lồng trong join. */
export function toListingTag(row: ListingTagRow): ListingTag {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    category: row.category,
    displayOrder: row.display_order,
  };
}

export function createSupabaseListingTagRepository(client: SupabaseClient): ListingTagRepository {
  return {
    async listActive() {
      const { data, error } = await client
        .from("listing_tags")
        .select("id, slug, label, category, display_order")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toListingTag);
    },
  };
}
