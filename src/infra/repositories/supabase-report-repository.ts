import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportRepository } from "@/domain/reports/repository";
import type { Report } from "@/domain/reports/types";

interface ReportRow {
  id: string;
  listing_id: string;
  reason: string;
  note: string | null;
  created_at: string;
  status: "open" | "reviewed";
}

function toReport(row: ReportRow): Report {
  return {
    id: row.id,
    listingId: row.listing_id,
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
    status: row.status,
  };
}

export function createSupabaseReportRepository(client: SupabaseClient): ReportRepository {
  return {
    async create(input) {
      const { data, error } = await client
        .from("reports")
        .insert({ listing_id: input.listingId, reason: input.reason, note: input.note ?? null })
        .select("id, listing_id, reason, note, created_at, status")
        .single();
      if (error) throw error;
      return toReport(data);
    },
  };
}
