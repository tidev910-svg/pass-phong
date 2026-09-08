import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegionRepository } from "@/domain/regions/repository";
import type { Region } from "@/domain/regions/types";

export interface RegionRow {
  id: number;
  slug: string;
  name: string;
  city: string;
  display_order: number;
  is_active: boolean;
}

/** Exported để các repository khác (vd listings) tái dùng khi map region lồng trong join. */
export function toRegion(row: RegionRow): Region {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    displayOrder: row.display_order,
    isActive: row.is_active,
  };
}

export function createSupabaseRegionRepository(client: SupabaseClient): RegionRepository {
  return {
    async listActive() {
      const { data, error } = await client
        .from("regions")
        .select("id, slug, name, city, display_order, is_active")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toRegion);
    },

    async findById(id) {
      const { data, error } = await client
        .from("regions")
        .select("id, slug, name, city, display_order, is_active")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toRegion(data) : null;
    },
  };
}
