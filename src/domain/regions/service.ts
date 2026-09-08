import type { RegionRepository } from "./repository";
import type { Region } from "./types";

export async function listActiveRegions(repo: RegionRepository): Promise<Region[]> {
  return repo.listActive();
}
