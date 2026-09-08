"use server";

import { redirect } from "next/navigation";
import { getRepositories } from "@/infra/container";
import { registerUser } from "@/domain/auth/service";
import { createSession } from "@/infra/session/session";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerAction(input: { username: string; password: string }): Promise<ActionResult> {
  let userId: string;
  try {
    const repos = getRepositories();
    const user = await registerUser(repos.auth, input);
    userId = user.id;
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  // Ngoài try/catch: để `redirect()` throw tự nhiên, không bị catch nhầm thành lỗi.
  await createSession(userId);
  redirect("/");
}
