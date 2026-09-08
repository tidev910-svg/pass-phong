import type { Region } from "./types";

export interface RegionRepository {
  listActive(): Promise<Region[]>;
  findById(id: number): Promise<Region | null>;
}
