import type { CreateSavedSearchInput, SavedSearch } from "./types";

export interface SavedSearchRepository {
  create(userId: string, input: CreateSavedSearchInput): Promise<SavedSearch>;
  listByUser(userId: string): Promise<SavedSearch[]>;
  findById(id: string): Promise<SavedSearch | null>;
  countByUser(userId: string): Promise<number>;
  touchLastViewed(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
