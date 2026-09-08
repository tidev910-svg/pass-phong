"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import {
  confirmListingSuccess,
  deleteListing,
} from "@/domain/listings/service";
import { reportListing } from "@/domain/reports/service";
import { toActionResult, requireSessionUserForAction, type ActionResult } from "@/app/_actions/action-helpers";

export async function confirmListingSuccessAction(listingId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUserForAction();
    const repos = getRepositories();
    await confirmListingSuccess({ listings: repos.listings, regions: repos.regions }, user.id, listingId);
    revalidatePath(`/tin/${listingId}`);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteOwnListingAction(listingId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUserForAction();
    const repos = getRepositories();
    await deleteListing({ listings: repos.listings, regions: repos.regions }, user.id, listingId);
    revalidatePath(`/tin/${listingId}`);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function reportListingAction(
  listingId: string,
  reason: string,
  note?: string,
): Promise<ActionResult> {
  try {
    const repos = getRepositories();
    await reportListing(repos.reports, { listingId, reason, note });
    return { ok: true };
  } catch (error) {
    return toActionResult(error);
  }
}
