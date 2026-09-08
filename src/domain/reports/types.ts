export type ReportStatus = "open" | "reviewed";

export interface Report {
  id: string;
  listingId: string;
  reason: string;
  note: string | null;
  createdAt: string;
  status: ReportStatus;
}

export interface CreateReportInput {
  listingId: string;
  reason: string;
  note?: string;
}
