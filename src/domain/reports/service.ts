import { ValidationError } from "@/domain/shared/errors";
import type { ReportRepository } from "./repository";
import type { CreateReportInput } from "./types";
import { createReportInputSchema } from "./validation";

export async function reportListing(repo: ReportRepository, input: CreateReportInput) {
  const parsed = createReportInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  return repo.create(parsed.data);
}
