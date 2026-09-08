import type { ListingTagRepository } from "./repository";
import type { ListingTag } from "./types";

export async function listActiveListingTags(repo: ListingTagRepository): Promise<ListingTag[]> {
  return repo.listActive();
}
