import "server-only";
import { getSupabaseServerClient } from "@/infra/supabase/server-client";
import { createSupabaseAuthRepository } from "@/infra/repositories/supabase-auth-repository";
import { createSupabaseRegionRepository } from "@/infra/repositories/supabase-region-repository";
import { createSupabaseListingRepository } from "@/infra/repositories/supabase-listing-repository";
import { createSupabaseSavedSearchRepository } from "@/infra/repositories/supabase-saved-search-repository";
import { createSupabaseReportRepository } from "@/infra/repositories/supabase-report-repository";
import { createSupabaseListingTagRepository } from "@/infra/repositories/supabase-listing-tag-repository";
import { createSupabaseFeedPreferencesRepository } from "@/infra/repositories/supabase-feed-preferences-repository";
import { createSupabaseListingSaveRepository } from "@/infra/repositories/supabase-listing-save-repository";

/**
 * Điểm wiring DUY NHẤT giữa domain và infra. Đổi hạ tầng (vd đổi Supabase
 * sang DB khác) chỉ cần đổi các hàm `createSupabase*Repository` ở đây —
 * domain/service không cần đổi.
 */
export function getRepositories() {
  const client = getSupabaseServerClient();
  return {
    auth: createSupabaseAuthRepository(client),
    regions: createSupabaseRegionRepository(client),
    listings: createSupabaseListingRepository(client),
    savedSearches: createSupabaseSavedSearchRepository(client),
    reports: createSupabaseReportRepository(client),
    listingTags: createSupabaseListingTagRepository(client),
    feedPreferences: createSupabaseFeedPreferencesRepository(client),
    listingSaves: createSupabaseListingSaveRepository(client),
  };
}
