import { z } from "zod";

export const MAX_SAVED_SEARCHES_PER_USER = 5;

export const createSavedSearchInputSchema = z.object({
  regionId: z.number().int().positive().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  moveOutDateFrom: z.string().optional(),
  moveOutDateTo: z.string().optional(),
});
