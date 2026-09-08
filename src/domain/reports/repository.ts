import type { CreateReportInput, Report } from "./types";

export interface ReportRepository {
  create(input: CreateReportInput): Promise<Report>;
}
